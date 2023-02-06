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
import { contractAddress, contractNamePrev, contractNameCurr, network, secInMs, privKey1, privKey2 } from '../deps.js'

// CRON JOB FOR SUBMIT-PRICE-DATA

// Start cron job, executing every day every minute 12:05-12:15
cron.schedule('34-39/1 20 * * *', async () => {
  let signature;
  let packageCV;
  // Read current-cycle-expiry
  const options = {
    contractAddress,
    contractName: contractNameCurr,
    functionName: 'get-current-cycle-expiry',
    functionArgs: [],
    network,
    senderAddress: contractAddress,
  };
  try {
    const currentCycleExpiry = await callReadOnlyFunction(options);

    // Get historical STX prices in a range of time
    const prices = await redstone.getHistoricalPrice("STX", {
      startDate: Number(currentCycleExpiry.value) - 30 * secInMs, // 30sec before expiry
      endDate: Number(currentCycleExpiry.value) + 90 * secInMs, // 90sec after expiry
      interval: 30 * 1000, // 30 seconds
    });

    // Filter out the first timestamp after the currentCycleExpiry
    let price = prices.filter((price) => price.timestamp > Number(currentCycleExpiry.value))[0]

    // Convert price data to format for contract call
    packageCV = pricePackageToCV({
      timestamp: price.timestamp,
      prices: [{ symbol: price.symbol, value: price.value }]
    });
    signature = liteSignatureToStacksSignature(price.liteEvmSignature);
  }
  catch (e) {
    console.log(`Error no values after filtering - ERROR: ${e}`)
  }

  // Make contract call to submit-price-data
  let txOptions = {
    contractAddress,
    contractName: contractNameCurr,
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

  let transaction = await makeContractCall(txOptions);
  let broadcastResponse = await broadcastTransaction(transaction, network);
  console.log(broadcastResponse);

  // Make contract call to submit-price-data
  txOptions = {
    contractAddress,
    contractName: contractNamePrev,
    functionName: 'submit-price-data',
    functionArgs: [
      packageCV.timestamp,
      packageCV.prices,
      bufferCV(signature)
    ],
    senderKey: privKey2,
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  }

  transaction = await makeContractCall(txOptions);
  broadcastResponse = await broadcastTransaction(transaction, network);
  console.log(broadcastResponse);
},
{
  scheduled: true,
  timezone: 'America/New_York'
}
);


console.log('submit-price-data script running...')