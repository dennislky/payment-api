export default class {
  constructor({
    APIError,
    ErrorCode,
    gateway,
  }) {
    Object.assign(this, {
      APIError,
      ErrorCode,
      gateway,
    });
  }

  genClientToken() {
    return async (req, res, next) => {
      let braintreeResult;
      try {
        braintreeResult = await this.gateway.customer.find(req.user.id);
      } catch (e) {
        braintreeResult = await this.gateway.customer.create({
          id: req.user.id,
          // email: req.user.email,
        });
        if (!braintreeResult.success) {
          const err = new this.APIError(braintreeResult.message, 500, this.ErrorCode.BRAINTREE_ERROR, true);
          return next(err);
        }
      }

      try {
        braintreeResult = await this.gateway.clientToken.generate({
          customerId: req.user.id,
        });
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
}
