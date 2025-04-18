const DAY = 24 * 60 * 60 * 1000
const WEEK = 7 * DAY
const MONTH = 30 * DAY
export const products = {
  [1]: {
    name: '$10 per 1 Day',
    amount: 10,
    timeStamp: DAY,
    price: 'price_1RC3TxHGKqFM322AqorGQ4sh'
  },
  [2]: {
    name: '$50 per 7 Day',
    amount: 50,
    timeStamp: WEEK,
    price: 'price_1RC3wxHGKqFM322AQflLex7r'
  },
  [3]: {
    name: '$100 per month',
    amount: 100,
    timeStamp: MONTH,
    price: 'price_1RC47BHGKqFM322AeNUgGAQg'
  }
};

export const productsName = Object.keys(products).reduce((acc, key) => {
  Object.assign(acc, { [products[key].price]: products[key].name })
  return acc
}, {});