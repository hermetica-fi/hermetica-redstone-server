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
import { contractAddress, contractNamePrev, contractNameCurr, network, secInMs, privKey1, privKey2, privKey3 } from '../deps.js'

// CRON JOB FOR BUY-OPTIONS

// Start cron job, executing every day every minute 11:40-11:55
cron.schedule('40-55/1 11 * * *', async () => {

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
    senderKey: privKey2,
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  }

  let transaction = await makeContractCall(txOptions);
  let broadcastResponse = await broadcastTransaction(transaction, network);
  console.log(broadcastResponse);

  // options = {
  //   contractAddress,
  //   contractName: contractNamePrev,
  //   functionName: 'get-options-for-sale',
  //   functionArgs: [],
  //   network,
  //   senderAddress: contractAddress,
  // };
  // optionsForSale = await callReadOnlyFunction(options);

  // txOptions = {
  //   contractAddress,
  //   contractName: contractNamePrev,
  //   functionName: 'buy-options',
  //   functionArgs: [
  //     packageCV.timestamp,
  //     packageCV.prices,
  //     bufferCV(signature),
  //     uintCV(Number(optionsForSale.value))
  //   ],
  //   senderKey: privKey2,
  //   validateWithAbi: true,
  //   network,
  //   anchorMode: AnchorMode.Any,
  //   postConditionMode: PostConditionMode.Allow,
  // }
  
  // transaction = await makeContractCall(txOptions);
  // broadcastResponse = await broadcastTransaction(transaction, network);
  // console.log(broadcastResponse);
},
{
  scheduled: true,
  timezone: 'America/New_York'
}
);

// Start cron job, executing every day every minute 12:40-12:55
cron.schedule('40-55/1 12 * * *', async () => {

  let options = {
    contractAddress,
    contractName: contractNamePrev,
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

console.log('buy-options script running...')