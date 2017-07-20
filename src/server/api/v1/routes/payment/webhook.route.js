
export default function ({
  express,
  validate,
  ParamValidation,
  webhook,
}) {
  const router = express.Router(); // eslint-disable-line new-cap

  router.route('/testWebhook')
    .get(webhook.testWebhook());

  router.route('/subscription')
    .post(webhook.subscriptionAction());

  return router;
}
