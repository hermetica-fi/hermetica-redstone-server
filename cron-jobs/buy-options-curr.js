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
import { contractAddress, contractNamePrev, contractNameCurr, network, secInMs, privKey1, privKey2, privKey3, privKey4, privKey5 } from '../deps.js'

// CRON JOB FOR BUY-OPTIONS

// Start cron job, executing Friday every minute 12:20-12:30 EST
cron.schedule('20-30/1 12 * * 5', async () => {

  let options = {
    contractAddress,
    contractName: contractNameCurr,
    functionName: 'get-options-for-sale',
    functionArgs: [],
    network,
    senderAddress: contractAddress,
  };
  let optionsForSale = await callReadOnlyFunction(options);

  const price = await redstone.getPrice("STX");
 
  const packageCV = pricePackageToCV({
    timestamp: price.timestamp,
    prices: [{ symbol: price.symbol, value: price.value }]
  });
  const signature = liteSignatureToStacksSignature(price.liteEvmSignature);

  let txOptions = {
    contractAddress,
    contractName: contractNameCurr,
    functionName: 'buy-options',
    functionArgs: [
      packageCV.timestamp,
      packageCV.prices,
      bufferCV(signature),
      uintCV(Number(optionsForSale.value))
    ],
    senderKey: privKey5,
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  }

  let transaction = await makeContractCall(txOptions);
  let broadcastResponse = await broadcastTransaction(transaction, network);
  console.log(broadcastResponse);

  options = {
    contractAddress,
    contractName: contractNamePrev,
    functionName: 'get-options-for-sale',
    functionArgs: [],
    network,
    senderAddress: contractAddress,
  };
  optionsForSale = await callReadOnlyFunction(options);

  txOptions = {
    contractAddress,
    contractName: contractNamePrev,
    functionName: 'buy-options',
    functionArgs: [
      packageCV.timestamp,
      packageCV.prices,
      bufferCV(signature),
      uintCV(Number(optionsForSale.value))
    ],
    senderKey: privKey3,
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

console.log('buy-options script running...')