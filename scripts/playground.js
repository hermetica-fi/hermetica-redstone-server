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

 // Read options-for-sale
 let options = {
  contractAddress,
  contractName: contractNameCurr,
  functionName: 'get-options-price-in-usd',
  functionArgs: [],
  network,
  senderAddress: contractAddress,
};

let optionsPriceInUSD = await callReadOnlyFunction(options);
console.log(optionsPriceInUSD)
console.log('optionsPriceInUSD', Number(optionsPriceInUSD.value.value) / 10**8)