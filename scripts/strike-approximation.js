import bs from "black-scholes";

// Settings
const targetP = 0.15
const targetI = 20

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
  if (i >= targetI) return [k, p];

  if (p < targetP) k = k * (1 - (p - targetP))
  else k = k * (1 + (targetP - p))
  
  const newP = bs.blackScholes(s, k, t, v, r, "call")
  return approxStrike(s, k, t, v, r, newP/s, i+1)
}

