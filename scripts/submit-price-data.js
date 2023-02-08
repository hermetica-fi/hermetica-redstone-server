import redstone from 'redstone-api';
import { liteSignatureToStacksSignature, pricePackageToCV } from '../utils/stacksjs-redstone.js';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  bufferCV,
  uintCV,
  callReadOnlyFunction,
  PostConditionMode
} from '@stacks/transactions';
import cron from 'node-cron';
import { contractAddress, contractNamePrev, contractNameCurr, network, secInMs, privKey1 } from '../deps.js'

// Read current-cycle-expiry
const options = {
  contractAddress,
  contractName: contractNamePrev,
  functionName: 'get-current-cycle-expiry',
  functionArgs: [],
  network,
  senderAddress: contractAddress,
};
const currentCycleExpiry = await callReadOnlyFunction(options);
console.log('currentcycleExpiry', currentCycleExpiry)

// Get historical STX prices in a range of time
const prices = await redstone.getHistoricalPrice("STX", {
  startDate: Number(currentCycleExpiry.value) - 30 * secInMs, // 30sec before expiry
  endDate: Number(currentCycleExpiry.value) + 90 * secInMs, // 90sec after expiry
  interval: 30 * 1000, // 30 seconds
});
console.log('prices', prices)
// Filter out the first timestamp after the currentCycleExpiry
let price = prices.filter((price) => price.timestamp > Number(currentCycleExpiry.value))[0]
console.log('price', price)

// Convert price data to format for contract call
const packageCV = pricePackageToCV({
  timestamp: price.timestamp,
  prices: [{ symbol: price.symbol, value: price.value }]
});
const signature = liteSignatureToStacksSignature(price.liteEvmSignature);

// Make contract call to submit-price-data
const txOptions = {
  contractAddress,
  contractName: contractNamePrev,
  functionName: 'submit-price-data',
  functionArgs: [
    packageCV.timestamp,
    packageCV.prices,
    bufferCV(signature)
  ],
  senderKey: privKey1,
  validateWithAbi: true,
  network,
  anchorMode: AnchorMode.Any,
  postConditionMode: PostConditionMode.Allow,
}

const transaction = await makeContractCall(txOptions);
const broadcastResponse = await broadcastTransaction(transaction, network);
console.log(broadcastResponse);