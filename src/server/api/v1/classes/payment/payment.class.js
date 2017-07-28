export default class {
  constructor({
    APIError,
    ErrorCode,
    RedisPrefix,
    RedisCacheDuration,
    braintreeGateway,
    paypalGateway,
    redisClient,
    PaymentModel,
  }) {
    Object.assign(this, {
      APIError,
      ErrorCode,
      RedisPrefix,
      RedisCacheDuration,
      braintreeGateway,
      paypalGateway,
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

  genClientToken() {
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

  processPayment() {
    return async (req, res, next) => {
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
          return next(err);
        }
        const paymentResult = await this.paymentSuccessAction({ transaction })
        if (paymentResult) {
          return res.formatSend(200, {
            paymentRefCode: paymentResult.refCode
          });
        }
        return res.formatSend(400, {});
      } catch (e) {
        const err = new this.APIError('Fail to process braintree payment', 500, this.ErrorCode.BRAINTREE_ERROR, true);
        return next(err);
      }
    };
  }

  async paymentSuccessAction({ transaction }) {
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
      return null;
    }
  }

  checkPayment() {
    return async (req, res, next) => {
      try {
        const key = `${this.RedisPrefix}:paymentRecord:${req.body.refCode}`
        const keys = await this.redisClient.exists(key)
        if (keys === 0) {
          const transaction = await this.braintreeGateway.transaction.find(req.body.refCode);
          const data = {
            name: transaction.customFields.customerName,
            phone: transaction.customFields.customerPhoneNumber,
            currency: transaction.customFields.currency,
            price: transaction.customFields.price,
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
