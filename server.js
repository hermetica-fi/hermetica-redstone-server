import { generateWallet, generateSecretKey, generateNewAccount } from '@stacks/wallet-sdk';
import { TransactionVersion } from '@stacks/transactions';
import redstone from 'redstone-api';
import { liteSignatureToStacksSignature, pricePackageToCV } from './stacksjs-redstone.js';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  bufferCV,
  callReadOnlyFunction
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import dotenv from 'dotenv';
dotenv.config()
import cron from 'node-cron';

// Define the Stacks network (mainnet/testnet)
const network = new StacksTestnet();

// Define contract constants
const contractAddress = 'ST1DSH0G45GZGGDJP3YVDEXTY4X2ZA89CKB5CZ6PK';
const contractName= "winged-feet-options-v0-7";

const secInMs = 1000;

// Generate a wallet and private key from a seed/secretKey
const password = 'password';
const secretKey = process.env.TESTNET_WALLET
let wallet = await generateWallet({
  secretKey,
  password
});
wallet = generateNewAccount(wallet);
const privKey = wallet.accounts[0].stxPrivateKey;

// Start cron job, executing every day at 12:02
cron.schedule('0 12 * * *', async () => {
  // Read current-cycle-expiry
  const options = {
    contractAddress,
    contractName,
    functionName: 'get-current-cycle-expiry',
    functionArgs: [],
    network,
    senderAddress: contractAddress,
  };

  const currentCycleExpiry = await callReadOnlyFunction(options);
  // let currentCycleExpiry = 1674518400000;

  // Get historical STX prices in a range of time
  const prices = await redstone.getHistoricalPrice("STX", {
    startDate: currentCycleExpiry - 30 * secInMs, // 30sec before expiry
    endDate: currentCycleExpiry + 90 * secInMs, // 90sec after expiry
    interval: 30 * 1000, // 30 seconds
  });

  // filter out the first timestamp after the currentCycleExpiry
  let price = prices.filter((price) => price.timestamp > currentCycleExpiry)[0]
    
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
    functionName: 'submit-price-data',
    functionArgs: [
      packageCV.timestamp,
      packageCV.prices,
      bufferCV(signature)
    ],
    senderKey: privKey,
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    PostConditionMode: 'Allow',
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

console.log('server running...')