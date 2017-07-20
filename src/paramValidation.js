import Joi from 'joi';

export default {
  createMerchant: {
    body: {
      phone: Joi.string().regex(/^[2,3,5,6,8,9][0-9]{7}$/).required(),
    },
  },
};
