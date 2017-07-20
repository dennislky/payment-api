
import {
  ServicePlan,
  PaymentRecord,
} from '../models';

// payment classes
import {
  PaymentClass,
  PaymentMethodClass,
  SubscriptionClass,
  ServicePlanClass,
  WebhookClass,
} from '../classes/payment';

// payment routes
import {
  PaymentRoutes,
  PaymentMethodRoutes,
  SubscriptionRoutes,
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

  const ServicePlanModel = ServicePlan({
    mongoose,
    APIError,
    ErrorCode,
  });
  const PaymentRecordModel = PaymentRecord({
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
  const paymentMethod = new PaymentMethodClass({
    APIError,
    ErrorCode,
    braintreeGateway,
    paypalGateway,
  });
  const subscription = new SubscriptionClass({
    APIError,
    ErrorCode,
    braintreeGateway,
    paypalGateway,
    ServicePlanModel,
    PaymentRecordModel,
  });
  const webhook = new WebhookClass({
    APIError,
    ErrorCode,
    braintreeGateway,
    paypalGateway,
    ServicePlanModel,
    PaymentRecordModel,
  });
  const servicePlan = new ServicePlanClass({
    APIError,
    ErrorCode,
    ServicePlanModel,
  });

  const paymentR = new PaymentRoutes({
    express,
    validate,
    ParamValidation,
    payment,
  });
  const paymentMethodR = new PaymentMethodRoutes({
    express,
    validate,
    ParamValidation,
    paymentMethod,
  });
  const subscriptionR = new SubscriptionRoutes({
    express,
    validate,
    ParamValidation,
    subscription,
  });
  const webhookR = new WebhookRoutes({
    express,
    validate,
    ParamValidation,
    webhook,
  });

  router.use('/payment', paymentR);
  router.use('/paymentMethod', paymentMethodR);
  router.use('/subscription', subscriptionR);
  router.use('/webhook', webhookR);

  return router;
}
