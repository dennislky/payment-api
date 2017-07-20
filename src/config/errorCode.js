
module.exports = {
  SUCCESS: {
    code: 0,
    message: 'success',
  },
  NOT_FOUND: {
    code: -1,
    message: 'data not found',
  },
  PAYMENT_RECORD_NOT_FOUND: {
    code: -18,
    message: '找不到付費紀錄',
  },
  BRAINTREE_ERROR: {
    code: -19,
    message: 'braintree error',
  },
  MAKE_PAYMENT_FORM_ERROR: {
    code: -20,
    message: 'make payment form error',
  },
  PAYMENT_CHECKING_FORM_ERROR: {
    code: -21,
    message: 'payment checking form error',
  },
};
