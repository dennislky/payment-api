
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
    message: '找不到付費紀錄',
  },
  BRAINTREE_ERROR: {
    code: -4,
    message: 'Braintree error',
  },
  PAYPAL_ERROR: {
    code: -5,
    message: 'Paypal error',
  },
};
