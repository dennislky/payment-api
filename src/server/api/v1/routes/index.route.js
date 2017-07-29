
import {
  Payment,
} from '../models';

// payment classes
import {
  PaymentClass,
} from '../classes/payment';

// payment routes
import {
  PaymentRoutes,
} from '../routes/payment';

export default function ({
  config,
  mongoose,
  express,
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
}) {
  const router = express.Router(); // eslint-disable-line new-cap

  /** GET /health-check - Check service health */
  router.get('/', (req, res) => res.send('hello world!'));

  const PaymentModel = Payment({
    mongoose,
    APIError,
    ErrorCode,
  });

  const payment = new PaymentClass({
    APIError,
    ErrorCode,
    RedisPrefix,
    RedisCacheDuration,
    PaypalConfig,
    fetch,
    braintreeGateway,
    redisClient,
    PaymentModel
  });

  const paymentR = new PaymentRoutes({
    express,
    validate,
    ParamValidation,
    payment,
  });

  router.use('/payment', paymentR);

  return router;
}
