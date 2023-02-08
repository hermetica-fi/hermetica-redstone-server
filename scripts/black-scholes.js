import bs from "black-scholes";
import redstone from 'redstone-api';
import axios from "axios";
import { secInMs, dayInMs } from "../deps.js";
import { approxStrike } from "./strike-approximation.js";
import { initStrikeMultiplier, STXVolMultiplier, optionDays } from "../settings.js";

/*
blackScholes(s, k, t, v, r, callPut)

@param s - Current price of the underlying
@param k - Strike price
@param t - Time to expiration in years
@param v - Volatility as a decimal
@param r - Annual risk-free interest rate as a decimal
@param callPut - The type of option to be priced - "call" or "put"
@return 
*/

export async function getOptionsPriceSTX() {
  // api endpoints
  const TBill13W = 'https://query2.finance.yahoo.com/v7/finance/quote?symbols=%5EIRX&fields=regularMarketPrice';
  const BTCVolBase = 'https://www.deribit.com/api/v2/public/get_volatility_index_data?currency=BTC';

  // (s) Current STX price
  const sRes = await redstone.getPrice("STX");
  const s = sRes.value;
  const timestampS = sRes.timestamp;
  console.log(`price`, s);
  console.log(`timestamp`, timestampS);

  // (k) Strike price
  const initK = s * (1 + initStrikeMultiplier);
  console.log(`strike`, initK);

  // (t) Time to expiration in years
  const t = optionDays / 365;
  console.log(`time`, t);

  // (v) Volatility as a decimal
  const volRes = await axios.get(
    BTCVolBase + `&end_timestamp=${timestampS}&resolution=60&start_timestamp=${timestampS - 60 * secInMs}`
  );

  const BTCv = volRes.data.result.data[1][4] / 100;
  console.log('vol', BTCv);
  const STXv = BTCv * (1 + STXVolMultiplier);

  // (r) Risk free rate
  const rRes = await axios.get(TBill13W);
  const r = rRes.data.quoteResponse.result[0].regularMarketPrice / 100;
  console.log('r', r);

  // Calculate first guess of p according to Black-Scholes method
  const p = bs.blackScholes(s, initK, t, STXv, r, "call");

  console.log(`p`, p);
  console.log(`p as % of price`, `${p / s * 100}%`);
  console.log('currAPY', (Math.pow((1 + p / s), 52) - 1) * 100 );

  return [s, initK, t, STXv, r, p];
}

// const [s, initK, t, STXv, r, firstGuessP] = await getOptionsPriceSTX()

// const [k, p] = approxStrike(s, initK, t, STXv, r, firstGuessP, 0)

// console.log('k', k, 'p', p, 'currAPY', (Math.pow((1 + p / s), 52) - 1) * 100)