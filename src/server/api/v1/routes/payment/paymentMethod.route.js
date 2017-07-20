
export default function ({
  express,
  validate,
  ParamValidation,
  paymentMethod,
}) {
  const router = express.Router(); // eslint-disable-line new-cap

  router.route('/')
    .get(paymentMethod.getPaymentMethod())
    .put(
      // validate(ParamValidation.makeDefaultPaymentMethod),
      paymentMethod.makeDefaultPaymentMethod(),
    )
    // .post(validate(ParamValidation.addPaymentMethod), paymentMethod.addPaymentMethod())
    // .delete(validate(ParamValidation.removePaymentMethod), paymentMethod.removePaymentMethod());

  return router;
}
