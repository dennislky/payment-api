import mongoose from 'mongoose';
import config from 'config';
import fetch from 'node-fetch';
import validate from 'express-validation';

import braintree from 'braintree';

import HttpServer from './server/httpServer';
import APIError from './APIError';
import ErrorCode from './config/errorCode';
import ParamValidation from './paramValidation';

mongoose.connect(
  `mongodb://${config.get('mongoose.url')}`,
  {
    server: {
      socketOptions: {
        keepAlive: 1,
      },
    },
  },
);
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.get('mongoose.url')}`);
});
mongoose.Promise = global.Promise;

const braintreeGateway = braintree.connect({
  environment: braintree.Environment[config.get('braintree.environment')],
  merchantId: config.get('braintree.merchantId'),
  publicKey: config.get('braintree.publicKey'),
  privateKey: config.get('braintree.privateKey'),
});

const paypalGateway = ''

const httpServer = new HttpServer({
  config,
  mongoose,
  braintreeGateway,
  paypalGateway,
  fetch,
  validate,
  APIError,
  ErrorCode,
  ParamValidation,
});

httpServer.start();
