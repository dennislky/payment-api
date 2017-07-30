import _ from 'lodash';

export default function({
  mongoose,
  APIError,
  ErrorCode,
}) {
  const PaymentSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    refCode: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
    {
      timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
    },
  );

  PaymentSchema.set('toObject', {
    transform: function t(doc, ret) {
      const value = ret;
      value.id = value._id;
      delete value._id;
      delete value.__v;
    },
  });

  PaymentSchema.statics = {
    count(filter = {}) {
      return this.find(filter)
        .count();
    },

    detail({ filter = {} }) {
      return this.findOne(filter)
        .exec()
        .then((payment) => {
          if (payment) {
            return payment;
          }
          const err = new APIError('Payment record not found', 404, ErrorCode.PAYMENT_RECORD_NOT_FOUND, true);
          return Promise.reject(err);
        });
    },

    createPayment({ paymentData }) {
      const paymentObj = _.pick(paymentData, [
        'name',
        'phone',
        'currency',
        'price',
        'refCode',
      ]);

      const payment = new this(paymentObj);

      return payment
        .save()
        .then((result) => {
          if (result) {
            return result;
          }
          const err = new APIError('Fail to create payment', 500, ErrorCode.PAYMENT_RECORD_CREATE_ERROR, true);
          return Promise.reject(err);
        })
        .catch(err => Promise.reject(err));
    },

    list({ skip = 0, first = 10, sortName = 'createdAt', sortOrder = 'desc', filter = {} } = {}) {
      return this.find(filter)
        .limit(first)
        .skip(skip)
        .sort({ [sortName]: (sortOrder === 'asc' ? 1 : -1) })
        .exec()
        .then((payments) => {
          if (payments) {
            return payments;
          }
          const err = new APIError('Fetch payment list error', 404, ErrorCode.PAYMENT_RECORD_NOT_FOUND, true);
          return Promise.reject(err);
        })
        .catch(err => Promise.reject(err));
    },

    updateData(conditions, newData) {
      return this.update(conditions, newData)
        .exec()
        .then((status) => {
          if (status.ok === 1 && status.nModified === 1) {
            return true;
          }
          const err = new APIError('Cannot update payment', 500, ErrorCode.PAYMENT_RECORD_UPDATE_ERROR, true);
          return Promise.reject(err);
        });
    },
  };

  return mongoose.model('Payment', PaymentSchema, 'payments');
}
