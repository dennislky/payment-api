
import _ from 'lodash';

const formatPaymentMethod = (paymentMethods) => {
  const formattedPaymentMethods = [];
  paymentMethods.forEach((item) => {
    formattedPaymentMethods.push({
      token: item.token,
      maskedNumber: item.maskedNumber,
      cardType: item.cardType,
      default: item.default,
      expirationDate: item.expirationDate,
      imageUrl: item.imageUrl,
    });
  });
  return formattedPaymentMethods;
};

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

  addPaymentMethod() {
    return async (req, res, next) => {
      try {
        const braintreeResult = await this.gateway.paymentMethod.create({
          customerId: req.user.id,
          paymentMethodNonce: req.body.nonce,
          options: {
            failOnDuplicatePaymentMethod: false,
          },
        });
        if (!braintreeResult.success) {
          const err = new this.APIError(braintreeResult.message, 500, this.ErrorCode.BRAINTREE_ERROR, true);
          return next(err);
        }
        return res.formatSend(200, braintreeResult);
      } catch (e) {
        const err = new this.APIError('Fail to add payment method', 500, this.ErrorCode.ADD_PAYMENT_METHOD_FAIL, true);
        return next(err);
      }
    };
  }

  makeDefaultPaymentMethod() {
    return async (req, res, next) => {
      try {
        const braintreeResult = await this.gateway.customer.find(req.user.id);
        const pickedPaymentMethods = _.filter(braintreeResult.paymentMethods,
          { token: req.body.token },
        );
        if (pickedPaymentMethods.length <= 0) {
          const err = new this.APIError('Payment method not found', 500, this.ErrorCode.PAYMENT_METHOD_NOT_FOUND, true);
          return next(err);
        }
      } catch (e) {
        const err = new this.APIError('Fail to find braintree customer', 500, this.ErrorCode.BRAINTREE_ERROR, true);
        return next(err);
      }

      try {
        await this.gateway.paymentMethod.update(req.body.token, {
          options: {
            makeDefault: true,
          },
        });
        return res.formatSend(200, { message: 'Payment method updated' });
      } catch (e) {
        const err = new this.APIError('Fail to update payment method', 500, this.ErrorCode.UPDATE_PAYMENT_METHOD_FAIL, true);
        return next(err);
      }
    };
  }

  removePaymentMethod() {
    return async (req, res, next) => {
      try {
        const braintreeResult = await this.gateway.customer.find(req.user.id);
        const pickedPaymentMethods = _.filter(braintreeResult.paymentMethods,
          { token: req.body.token },
        );
        if (pickedPaymentMethods.length <= 0) {
          const err = new this.APIError('Payment method not found', 500, this.ErrorCode.PAYMENT_METHOD_NOT_FOUND, true);
          return next(err);
        }
      } catch (e) {
        const err = new this.APIError('Fail to find braintree customer', 500, this.ErrorCode.BRAINTREE_ERROR, true);
        return next(err);
      }

      try {
        await this.gateway.paymentMethod.delete(req.body.token);
        return res.formatSend(200, { message: 'Payment method removed' });
      } catch (e) {
        const err = new this.APIError('Fail to delete payment method', 500, this.ErrorCode.DELETE_PAYMENT_METHOD_FAIL, true);
        return next(err);
      }
    };
  }

  getPaymentMethod() {
    return async (req, res, next) => {
      try {
        const braintreeResult = await this.gateway.customer.find(req.user.id);
        // console.log(braintreeResult)
        return res.formatSend(200, formatPaymentMethod(braintreeResult.paymentMethods));
        // return res.formatSend(200, braintreeResult);
      } catch (e) {
        const err = new this.APIError('Fail to find braintree customer', 500, this.ErrorCode.BRAINTREE_ERROR, true);
        return next(err);
      }
    };
  }
}
