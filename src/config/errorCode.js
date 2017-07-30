
module.exports = {
  SUCCESS: {
    code: 0,
    message: 'success',
  },
  MAKE_PAYMENT_FORM_ERROR: {
    code: -1,
    message: 'Make payment form error',
  },
  PAYMENT_CHECKING_FORM_ERROR: {
    code: -2,
    message: 'Payment checking form error',
  },
  PAYMENT_RECORD_NOT_FOUND: {
    code: -3,
    message: 'Cannot find corresponing payment record',
  },
  BRAINTREE_ERROR: {
    code: -4,
    message: 'Braintree payment error, please check your credit card info',
  },
  PAYPAL_ERROR: {
    code: -5,
    message: 'Paypal payment error, please check your credit card info',
  },
  PAYMENT_RECORD_CREATE_ERROR: {
    code: -6,
    message: 'Payment record create error'
  },
  PAYMENT_RECORD_UPDATE_ERROR: {
    code: -7,
    message: 'Payment record update error'
  },
  AMEX_CURRENCY_ERROR: {
    code: -8,
    message: 'American Express can only be used with USD'
  }
};
