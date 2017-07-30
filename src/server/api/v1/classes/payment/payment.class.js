import base64 from 'base-64'

export default class {
  constructor({
    APIError,
    ErrorCode,
    RedisPrefix,
    RedisCacheDuration,
    PaypalConfig,
    fetch,
    braintreeGateway,
    redisClient,
    PaymentModel,
  }) {
    Object.assign(this, {
      APIError,
      ErrorCode,
      RedisPrefix,
      RedisCacheDuration,
      PaypalConfig,
      fetch,
      braintreeGateway,
      redisClient,
      PaymentModel,
    });
  }

  getMakePaymentForm() {
    return async (req, res, next) => {
      try {
        return res.render('makePaymentForm', {
          layout: 'makePaymentForm',
        });
      } catch (e) {
        const err = new this.APIError('Fail to get make payment form', 500, this.ErrorCode.MAKE_PAYMENT_FORM_ERROR, true);
        return next(err);
      }
    };
  }

  getPaymentCheckingForm() {
    return async (req, res, next) => {
      try {
        return res.render('paymentCheckingForm', {
          layout: 'paymentCheckingForm',
        });
      } catch (e) {
        const err = new this.APIError('Fail to get payment checking form', 500, this.ErrorCode.PAYMENT_CHECKING_FORM_ERROR, true);
        return next(err);
      }
    };
  }

  genBraintreeClientToken() {
    return async (req, res, next) => {
      try {
        const braintreeResult = await this.braintreeGateway.clientToken.generate({});
        if (!braintreeResult.success) {
          const err = new this.APIError(braintreeResult.message, 500, this.ErrorCode.BRAINTREE_ERROR, true);
          return next(err);
        }
        return res.formatSend(200, braintreeResult);
      } catch (e) {
        const err = new this.APIError('Fail to generate braintree client token', 500, this.ErrorCode.BRAINTREE_ERROR, true);
        return next(err);
      }
    };
  }

  async genPaypalAccessToken() {
    try {
      const credentials = base64.encode(`${this.PaypalConfig.clientId}:${this.PaypalConfig.secret}`)
      const result = await this.fetch(this.PaypalConfig.domain+'/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Authorization': 'Basic '+credentials,
        },
        body: 'grant_type=client_credentials',
      })
      if (result.ok) {
        const info = await result.json()
        return info.access_token
      } else {
        const err = new this.APIError('Fail to generate paypal access token', 500, this.ErrorCode.PAYPAL_ERROR, true);
        return next(err);
      }
    } catch (e) {
      const err = new this.APIError('Fail to generate paypal access token', 500, this.ErrorCode.BRAINTREE_ERROR, true);
      return next(err);
    }
  }

  convertCardType(cardType) {
    if (cardType === 'Visa') {
      return 'visa'
    } else if (cardType === 'Mastercard') {
      return 'mastercard'
    } else if (cardType === 'American Express') {
      return 'amex'
    } else if (cardType === 'JCB') {
      return 'jcb'
    } else if (cardType === 'Discover') {
      return 'discover'
    } else {
      return ''
    }
  }

  processPayment() {
    return async (req, res, next) => {
      try {
        let paymentResult
        const cardShortType = this.convertCardType(req.body.cardType)
        const currency = req.body.currency
        if (cardShortType === 'amex' || currency === 'USD' || currency === 'EUR' || currency === 'AUD') {
          if (cardShortType === 'amex' && currency !== 'USD') {
            return res.formatSend(200, {}, this.ErrorCode.AMEX_CURRENCY_ERROR.code, this.ErrorCode.AMEX_CURRENCY_ERROR.message)
          }
          paymentResult = await this.processPaypalPayment(req)
        } else {
          paymentResult = await this.processBraintreePayment(req)
        }
        if (paymentResult) {
          return res.formatSend(200, {
            paymentRefCode: paymentResult.refCode
          })
        }
        return res.formatSend(200, {}, this.ErrorCode.PAYMENT_RECORD_CREATE_ERROR.code, this.ErrorCode.PAYMENT_RECORD_CREATE_ERROR.message)
      } catch (e) {
        // return next(e);
        return res.formatSend(200, {}, e.errorCode.code, e.errorCode.message)
      }
    };
  }

  async processBraintreePayment(req) {
    try {
      const saleData = {
        amount: req.body.price,
        merchantAccountId: `Test-${req.body.currency}`,
        paymentMethodNonce: req.body.nonce,
        options: {
          submitForSettlement: true,
        },
        customFields: {
          customer_name: req.body.name,
          customer_phone_number: req.body.phone,
          currency: req.body.currency,
          price: req.body.price,
        },
      }
      const transaction = await this.braintreeGateway.transaction.sale(saleData);
      if (!transaction.success) {
        const err = new this.APIError(transaction.message, 500, this.ErrorCode.BRAINTREE_ERROR, true);
        return Promise.reject(err);
      }
      const paymentResult = await this.braintreePaymentSuccessAction({ transaction })
      return paymentResult
    } catch (e) {
      const err = new this.APIError('Fail to process braintree payment', 500, this.ErrorCode.BRAINTREE_ERROR, true);
      return Promise.reject(err);
    }
  }

  async processPaypalPayment(req) {
    try {
      const paypalAccessToken = await this.genPaypalAccessToken()
      const customerData = {
        customer_name: req.body.name,
        customer_phone_number: req.body.phone,
        currency: req.body.currency,
        price: req.body.price,
      }
      const saleData = {
        intent: 'sale',
        payer: {
          payment_method: 'credit_card',
          funding_instruments: [{
            credit_card: {
              number: req.body.number,
              type: this.convertCardType(req.body.cardType),
              expire_month: req.body.expirationDate.split('/')[0],
              expire_year: '20'+req.body.expirationDate.split('/')[1],
              cvv2: req.body.cvv,
            }
          }]
        },
        transactions: [{
          amount: {
            total: req.body.price.toString(),
            currency: req.body.currency
          }
        }]
      }
      const result = await this.fetch(this.PaypalConfig.domain+'/v1/payments/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+paypalAccessToken,
        },
        body: JSON.stringify(saleData),
      })
      if (result.ok) {
        const transaction = await result.json()
        const paymentResult = await this.paypalPaymentSuccessAction({ customerData, transaction })
        return paymentResult
      }
      const err = new this.APIError(result.statusText, 500, this.ErrorCode.PAYPAL_ERROR, true);
      return Promise.reject(err);
    } catch (e) {
      const err = new this.APIError('Fail to process paypal payment', 500, this.ErrorCode.PAYPAL_ERROR, true);
      return Promise.reject(err);
    }
  }

  async braintreePaymentSuccessAction({ transaction }) {
    const paymentData = {
      name: transaction.transaction.customFields.customerName,
      phone: transaction.transaction.customFields.customerPhoneNumber,
      currency: transaction.transaction.customFields.currency,
      price: transaction.transaction.customFields.price,
      refCode: transaction.transaction.id,
    };
    console.log(paymentData);

    try {
      const payment = await this.PaymentModel.createPayment({
        paymentData,
      });
      return paymentData;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async paypalPaymentSuccessAction({ customerData, transaction }) {
    const paymentData = {
      name: customerData.customer_name,
      phone: customerData.customer_phone_number,
      currency: customerData.currency,
      price: customerData.price,
      refCode: transaction.id,
    };
    console.log(paymentData);

    try {
      const payment = await this.PaymentModel.createPayment({
        paymentData,
      });
      return paymentData;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  checkPayment() {
    return async (req, res, next) => {
      try {
        const key = `${this.RedisPrefix}:paymentRecord:${req.body.refCode}`
        const keys = await this.redisClient.exists(key)
        if (keys === 0) {
          // const transaction = await this.braintreeGateway.transaction.find(req.body.refCode);
          const record = await this.PaymentModel.detail({ filter: { name: req.body.name, refCode: req.body.refCode} })
          const data = {
            name: record.name,
            phone: record.phone,
            currency: record.currency,
            price: record.price,
          }
          await this.redisClient.setex(`${this.RedisPrefix}:paymentRecord:${req.body.refCode}`, this.RedisCacheDuration, JSON.stringify(data))
          return res.formatSend(200, data);
        }
        const paymentRecordCache = await this.redisClient.get(key)
        const data = JSON.parse(paymentRecordCache)
        return res.formatSend(200, data)
      } catch (e) {
        return res.formatSend(200, {}, this.ErrorCode.PAYMENT_RECORD_NOT_FOUND.code, this.ErrorCode.PAYMENT_RECORD_NOT_FOUND.message);
      }
    };
  }
}
