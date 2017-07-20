
export default function ({
  express,
  validate,
  ParamValidation,
  payment,
}) {
  const router = express.Router(); // eslint-disable-line new-cap

  router.route('/clientToken')
    .get(payment.genClientToken());
    // .get(validate(paramValidation.filterCoupon), couponCtrl.list);

  return router;
}
