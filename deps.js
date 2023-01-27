import { generateWallet, generateNewAccount } from '@stacks/wallet-sdk';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { URL } from 'url'; // in Browser, the URL in native accessible on window
import path from 'path';
import dotenv from 'dotenv';

// Load the .env file into process.env
const __dirname = new URL('.', import.meta.url).pathname;
dotenv.config({ path: path.resolve(__dirname, './.env') })

// Define the Stacks network (mainnet/testnet)
export const network = new StacksTestnet();
// Define contract constants
export const contractAddress = 'ST1DSH0G45GZGGDJP3YVDEXTY4X2ZA89CKB5CZ6PK';
export const contractNamePrev = "winged-feet-options-v0-7";
export const contractNameCurr = "winged-feet-options-v0-8";

// Define time constants
export const secInMs = 1000;

// Generate a wallet and private key from a seed/secretKey
const secretKey = process.env.TESTNET_WALLET
const password = 'password';
let wallet = await generateWallet({
  secretKey,
  password
});
wallet = generateNewAccount(wallet); 
wallet = generateNewAccount(wallet);

export const privKey1 = wallet.accounts[0].stxPrivateKey;
export const privKey2 = wallet.accounts[1].stxPrivateKey;
export const privKey3 = wallet.accounts[2].stxPrivateKey;