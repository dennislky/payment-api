
export default function ({
  express,
  validate,
  ParamValidation,
  payment,
}) {
  const router = express.Router(); // eslint-disable-line new-cap

  router.route('/')
    .post(validate(ParamValidation.validatePayment), payment.processPayment());

  router.route('/checkPayment')
    .post(validate(ParamValidation.validateCheckPayment), payment.checkPayment());

  router.route('/makePaymentForm')
    .get(payment.getMakePaymentForm());

  router.route('/paymentCheckingForm')
    .get(payment.getPaymentCheckingForm());

  router.route('/braintreeClientToken')
    .get(payment.genBraintreeClientToken());

  return router;
}
