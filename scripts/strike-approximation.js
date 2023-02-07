import bs from "black-scholes";
import { STXtargetAPY } from "../settings.js";

// Settings
const accDiff = 0.01 // acceptable difference between STXtargetAPY and currAPY
const approxStep = 0.002 // step increase/decrease in strike for every approximation
const targetI = 7 // Number of iterations of approxStrike 

/*
blackScholes(s, k, t, v, r, callPut)

s - Current price of the underlying
k - Strike price
t - Time to expiration in years
v - Volatility as a decimal
r - Annual risk-free interest rate as a decimal
callPut - The type of option to be priced - "call" or "put"
*/

/*
@param strike: options strike price in usd
@param p: options price in % of underlying price
@param iterations: rounds of application of approxStrike algorithm
*/
export function approxStrike (s, k, t, v, r, p, i) {
  const currAPY = Math.pow(1 + p / s, 52) - 1

  if (STXtargetAPY * (1 - accDiff) <= currAPY && currAPY <= STXtargetAPY * (1 + accDiff)) return [k, p]
  if (i >= targetI) return [k, p];

  if (currAPY < STXtargetAPY) k = k * (1 - approxStep)
  else k = k * (1 + approxStep)
  
  const newP = bs.blackScholes(s, k, t, v, r, "call")
  console.log(`Round ${i}, currAPY: ${currAPY}, k: ${k}, oldP: ${p}, newP: ${newP}`)
  return approxStrike(s, k, t, v, r, newP, i+1)
}

