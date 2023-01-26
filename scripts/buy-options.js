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
import { contractAddress, contractNamePrev, contractNameCurr, network, secInMs, privKey1, privKey2, privKey3 } from '../utils/deps.js'

// Get current STX price
const price = await redstone.getPrice("STX");

// Convert price data to format for contract call
const packageCV = pricePackageToCV({
  timestamp: price.timestamp,
  prices: [{ symbol: price.symbol, value: price.value }]
});
const signature = liteSignatureToStacksSignature(price.liteEvmSignature);

// Make contract call to submit-price-data
let txOptions = {
  contractAddress,
  contractName: contractNameCurr,
  functionName: 'buy-options',
  functionArgs: [
    packageCV.timestamp,
    packageCV.prices,
    bufferCV(signature),
    uintCV(1000)
  ],
  senderKey: privKey2,
  validateWithAbi: true,
  network,
  anchorMode: AnchorMode.Any,
  postConditionMode: PostConditionMode.Allow,
}

let transaction = await makeContractCall(txOptions);
let broadcastResponse = await broadcastTransaction(transaction, network);
console.log(broadcastResponse);

console.log('buy-options script running...')