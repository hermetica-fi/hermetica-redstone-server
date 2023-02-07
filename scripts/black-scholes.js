import bs from "black-scholes";
import redstone from 'redstone-api';
import axios from "axios";
import { secInMs, dayInMs } from "../deps.js";
import { approxStrike } from "./strike-approximation.js";

/*
blackScholes(s, k, t, v, r, callPut)

s - Current price of the underlying
k - Strike price
t - Time to expiration in years
v - Volatility as a decimal
r - Annual risk-free interest rate as a decimal
callPut - The type of option to be priced - "call" or "put"
*/

// Settings
const strikeMultiplier = 0.15;
const optionDays = 7;
const volMultiplier = 0.2;

// api endpoints

const TBill13W = 'https://query2.finance.yahoo.com/v7/finance/quote?symbols=%5EIRX&fields=regularMarketPrice'
const BTCVolBase = 'https://www.deribit.com/api/v2/public/get_volatility_index_data?currency=BTC'

// (s) Current STX price
const price = await redstone.getPrice("STX");
console.log(`price`, price.value)
console.log(`timestamp`, price.timestamp)

// (k) Strike price
const strike = price.value * (1 + strikeMultiplier);
console.log(`strike`, strike)

// (t) Time to expiration in years
const time = optionDays / 365
console.log(`time`, time)

// (v) Volatility as a decimal
// Make a request for a user with a given ID
const volRes = await axios.get(
  BTCVolBase + `&end_timestamp=${price.timestamp}&resolution=60&start_timestamp=${price.timestamp - 60 * secInMs}`
)

const vol = volRes.data.result.data[1][4] / 100;
console.log('vol', vol)

// (r) Risk free rate
// Make a request for a user with a given ID
const rRes = await axios.get(TBill13W);
const r = rRes.data.quoteResponse.result[0].regularMarketPrice / 100;
console.log('r', r)

// Calculate optionsPrice according to Black-Scholes method
const optionsPrice = bs.blackScholes(price.value, strike, time, vol * (1 + volMultiplier), r, "call")

console.log(`optionsPrice`, optionsPrice)
console.log(`optionsPrice as % of price`, `${optionsPrice / price.value * 100}%`)

console.log('targetAPY', Math.pow((1 + optionsPrice / price.value), 52))

// export function approxStrike (s, k, t, v, r, p, i) {

const [k, p] = approxStrike(price.value, strike, time, vol * (1 + volMultiplier), r, optionsPrice, 0)

console.log('k', k, 'p', p)