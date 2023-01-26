import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode
} from '@stacks/transactions';
import { contractAddress, contractNamePrev, contractNameCurr, network, secInMs, privKey1 } from '../utils/deps.js'

// Previous contract
console.log(contractNamePrev)
console.log(contractNameCurr)

let txOptions = {
  contractAddress,
  contractName: contractNamePrev,
  functionName: 'process-withdrawals-from-options',
  functionArgs: [],
  senderKey: privKey1,
  validateWithAbi: true,
  network,
  anchorMode: AnchorMode.Any,
  postConditionMode: PostConditionMode.Allow,
}

let transaction = await makeContractCall(txOptions);
let broadcastResponse = await broadcastTransaction(transaction, network);
console.log(broadcastResponse);

// Current contract

txOptions = {
  contractAddress,
  contractNamne: contractNameCurr,
  functionName: 'process-withdrawals-from-options',
  functionArgs: [],
  senderKey: privKey1,
  validateWithAbi: true,
  network,
  anchorMode: AnchorMode.Any,
  postConditionMode: PostConditionMode.Allow,
}

transaction = await makeContractCall(txOptions);
broadcastResponse = await broadcastTransaction(transaction, network);
console.log(broadcastResponse);