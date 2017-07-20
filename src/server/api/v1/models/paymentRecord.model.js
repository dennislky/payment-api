import _ from 'lodash';

export default function({
  mongoose,
  APIError,
  ErrorCode,
}) {
  const PaymentRecordSchema = new mongoose.Schema({
    paymentItem: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['paid', 'unpaid'],
      required: true,
      default: 'unpaid',
    },
    payTime: {
      type: Date,
      default: Date.now,
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

  PaymentRecordSchema.set('toObject', {
    transform: function t(doc, ret) {
      const value = ret;
      value.id = value._id;
      delete value._id;
      delete value.__v;
    },
  });

  PaymentRecordSchema.statics = {
    count(filter = {}) {
      return this.find(filter)
        .count();
    },

    detail({ filter = {} }) {
      return this.findOne(filter)
        .exec()
        .then((paymentRecord) => {
          if (paymentRecord) {
            return paymentRecord;
          }
          const err = new APIError('Payment record not found', 404, ErrorCode.NOT_FOUND, true);
          return Promise.reject(err);
        });
    },

    createPaymentRecord({ paymentRecordData }) {
      const paymentRecordObj = _.pick(paymentRecordData, [
        'paymentItem',
        'merchant',
        'amount',
        'referenceNo',
        'status',
        'payTime',
      ]);

      const paymentRecord = new this(paymentRecordObj);

      return paymentRecord
        .save()
        .then((result) => {
          if (result) {
            return result;
          }
          const err = new APIError('Fail to create payment record', 500, ErrorCode.NOT_FOUND, true);
          return Promise.reject(err);
        })
        .catch(err => Promise.reject(err));
    },

    list({ skip = 0, first = 10, sortName = 'createdAt', sortOrder = 'desc', filter = {} } = {}) {
      return this.find(filter)
        .populate('shop.id')
        .limit(first)
        .skip(skip)
        .sort({ [sortName]: (sortOrder === 'asc' ? 1 : -1) })
        .exec()
        .then((paymentRecords) => {
          if (paymentRecords) {
            return paymentRecords;
          }
          const err = new APIError('Fetch payment record list error', 500, ErrorCode.NOT_FOUND, true);
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
          const err = new APIError('Cannot update payment record', 500, ErrorCode.NOT_FOUND, true);
          return Promise.reject(err);
        });
    },
  };

  return mongoose.model('PaymentRecord', PaymentRecordSchema, 'paymentRecords');
}
