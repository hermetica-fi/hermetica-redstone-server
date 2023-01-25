import redstone from 'redstone-api';
import { liteSignatureToStacksSignature, pricePackageToCV } from './stacksjs-redstone.js';
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
import { contractAddress, contractName, network, secInMs, privKey2 } from './utils.js'

// CRON JOB FOR BUY-OPTIONS

// Start cron job, executing every day at 12:40
cron.schedule('40 12-13 * * *', async () => {

  // Get current STX price
  const price = await redstone.getPrice("STX");
 
  // Convert price data to format for contract call
  const packageCV = pricePackageToCV({
    timestamp: price.timestamp,
    prices: [{ symbol: price.symbol, value: price.value }]
  });
  const signature = liteSignatureToStacksSignature(price.liteEvmSignature);

  // Make contract call to submit-price-data
  const txOptions = {
    contractAddress,
    contractName,
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

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  console.log(broadcastResponse);
},
{
  scheduled: true,
  timezone: 'America/New_York'
}
);

console.log('buy-options script running...')