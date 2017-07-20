
import {
  Payment,
} from '../models';

// payment classes
import {
  PaymentClass,
  WebhookClass,
} from '../classes/payment';

// payment routes
import {
  PaymentRoutes,
  WebhookRoutes,
} from '../routes/payment';

export default function ({
  config,
  mongoose,
  express,
  braintreeGateway,
  paypalGateway,
  fetch,
  validate,
  APIError,
  ErrorCode,
  ParamValidation,
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
    braintreeGateway,
    paypalGateway,
  });
  const webhook = new WebhookClass({
    APIError,
    ErrorCode,
    braintreeGateway,
    paypalGateway,
    PaymentModel
  });

  const paymentR = new PaymentRoutes({
    express,
    validate,
    ParamValidation,
    payment,
  });
  const webhookR = new WebhookRoutes({
    express,
    validate,
    ParamValidation,
    webhook,
  });

  router.use('/payment', paymentR);
  router.use('/webhook', webhookR);

  return router;
}
