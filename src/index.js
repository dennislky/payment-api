import mongoose from 'mongoose';
import config from 'config';
import fetch from 'node-fetch';
import validate from 'express-validation';

import braintree from 'braintree';
import redis from 'ioredis';

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

const PaypalConfig = config.get('paypal')

const redisClient = redis.createClient(config.get('redis.url'))
const RedisPrefix = config.get('redis.prefix')
const RedisCacheDuration = config.get('redis.cacheDuration')

const httpServer = new HttpServer({
  config,
  mongoose,
  braintreeGateway,
  redisClient,
  fetch,
  validate,
  APIError,
  ErrorCode,
  ParamValidation,
  RedisPrefix,
  RedisCacheDuration,
  PaypalConfig,
});

httpServer.start();
