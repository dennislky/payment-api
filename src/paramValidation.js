import Joi from 'joi';

export default {
  validatePayment: {
    body: {
      name: Joi.string().required(),
      phone: Joi.string().regex(/^[2,3,5,6,8,9][0-9]{7}$/).required(),
      // currency: Joi.string().regex(/^(HKD,USD,AUD,EUR,JPY,CNY){1}$/).required(),
      currency: Joi.string().required(),
      price: Joi.number().required(),
      nonce: Joi.string().required(),
      cardType: Joi.string().required(),
      number: Joi.number().required(),
      cvv: Joi.number().required(),
      expirationDate: Joi.string().required(),
    },
  },

  validateCheckPayment: {
    body: {
      name: Joi.string().required(),
      refCode: Joi.string().required(),
    },
  },
};
