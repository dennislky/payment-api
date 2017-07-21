
module.exports = {
  env: process.env.NODE_ENV,
  mongoose: {
    url: process.env.MONGODB_URL,
  },
  server: {
    port: process.env.PORT,
  },
  braintree: {
    environment: process.env.BRAINTREE_SANDBOX || 'Sandbox',
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
    merchantAccountId: process.env.BRAINTREE_MERCHANT_ACCOUNT_ID,
  },
  paypal: {
    environment: process.env.PAYPAL_SANDBOX || 'Sandbox',
    clientId: process.env.PAYPAL_CLIENT_ID,
    secret: process.env.PAYPAL_SECRET,
  }
};
