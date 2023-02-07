
function getSDAsPerc (array) {
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  return Math.sqrt(array.map(x => Math.pow((x - mean) / mean, 2)).reduce((a, b) => a + b) / n)
}

function getStandardDeviation (array) {
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  return Math.sqrt(array.map(x => Math.pow((x - mean), 2)).reduce((a, b) => a + b) / n)
}


// Get historical STX prices in a range of time
const prices = await redstone.getHistoricalPrice("STX", {
  startDate: price.timestamp - 100 * dayInMs, // 30 days ago
  endDate: price.timestamp, // now
  interval: dayInMs * 24, // 1 day
});

let pricesArr = [];
prices.forEach((price) => {
  pricesArr.push(price.value)
})

const pricesArrDaily = pricesArr.filter((price, i) => i % 24 == 0)

// console.log(pricesArr)
console.log(pricesArr.length)
console.log(pricesArrDaily.length)

const sd = getStandardDeviation(pricesArrDaily)
const sdPerc = getSDAsPerc(pricesArrDaily)

console.log(sdPerc)
console.log(sd)

