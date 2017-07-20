
export default function ({
  express,
  validate,
  ParamValidation,
  payment,
}) {
  const router = express.Router(); // eslint-disable-line new-cap

  router.route('/')
    .post((req, res) => {
      console.log(req.body);
      res.send('OK');
    });

  router.route('/makePaymentForm')
    .get(payment.getMakePaymentForm());

  router.route('/paymentCheckingForm')
    .get(payment.getPaymentCheckingForm());

  router.route('/clientToken')
    .get(payment.genClientToken());

  return router;
}
