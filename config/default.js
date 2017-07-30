
module.exports = {
  env: process.env.NODE_ENV || 'dev',
  mongoose: {
    url: process.env.MONGODB_URL, // '<username>:<password>@<url>:<port>/<table>?ssl=true'
  },
  server: {
    port: process.env.PORT || 8084,
  },
  braintree: {
    environment: process.env.BRAINTREE_SANDBOX || 'Sandbox',
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
    merchantAccountId: process.env.BRAINTREE_MERCHANT_ACCOUNT_ID,
  },
  paypal: {
    environment: process.env.PAYPAL_SANDBOX || 'sandbox',
    clientId: process.env.PAYPAL_CLIENT_ID,
    secret: process.env.PAYPAL_SECRET,
    domain: process.env.PAYPAL_DOMAIN || 'https://api.sandbox.paypal.com',
  },
  redis: {
    url: process.env.REDIS_URL, // 'redis://<url>:6379'
    prefix: process.env.REDIS_PREFIX,
    cacheDuration: process.env.REDIS_CACHE_DURATION || 60,
  },
};
