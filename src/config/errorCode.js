
module.exports = {
  SUCCESS: {
    code: 0,
    message: 'success',
  },
  NOT_FOUND: {
    code: -1,
    message: 'data not found',
  },
  LOGIN_REDIRECT: {
    code: -2,
    message: 'login redirect',
  },
  TOKEN_INVALID: {
    code: -3,
    message: 'token invalid',
  },
  TOKEN_EXPIRED: {
    code: -4,
    message: 'token expired',
  },
  PAYMENT_RECORD_NOT_FOUND: {
    code: -18,
    message: '找不到付費紀錄',
  },
  BRAINTREE_ERROR: {
    code: -19,
    message: 'braintree error',
  },
  PAYMENT_METHOD_NOT_FOUND: {
    code: -20,
    message: '找不到信用卡',
  },
  DELETE_PAYMENT_METHOD_FAIL: {
    code: -21,
    message: '刪除信用卡失敗',
  },
  UPDATE_PAYMENT_METHOD_FAIL: {
    code: -22,
    message: '更新信用卡失敗',
  },
};
