import braintree from 'braintree';

export default class {
  constructor({
    APIError,
    ErrorCode,
    braintreeGateway,
    paypalGateway,
    PaymentModel,
  }) {
    Object.assign(this, {
      APIError,
      ErrorCode,
      braintreeGateway,
      paypalGateway,
      PaymentModel,
    });
  }

  async subscriptionWentActive({ subscription }) {
    this.subscription = subscription;
    let payment;
    let result;
    let braintreeResult;

    try {
      braintreeResult = await this.braintreeGateway.subscription.find(this.subscription.id);
      console.log(braintreeResult);
    } catch (err) {
      console.log(err);
      return false;
    }

    const paymentData = {
      name: '',
      phone: '',
      currency: '',
      price: braintreeResult.price,
    };
    console.log(paymentData);

    try {
      payment = await this.PaymentModel.createPayment({
        paymentData,
      });
      console.log(payment);
    } catch (err) {
      console.log(err);
      return false;
    }

    return true;
  }

  subscriptionAction() {
    return async (req, res) => {
      this.braintreeGateway.webhookNotification.parse(
        req.body.bt_signature,
        req.body.bt_payload,
        async (err, webhookNotification) => {
          if (err) {
            console.log(err);
          }
          // console.log(webhookNotification);
          const { kind, subscription } = webhookNotification;
          switch (kind) {
            case 'subscription_went_active':
              if (await this.subscriptionWentActive({ subscription })) {
                return res.formatSend(200, webhookNotification);
              }
              break;
            default:
          }
          return res.formatSend(200, false);
        },
      );
    };
  }

  testWebhook() {
    return async (req, res) => {
      const { id } = req.query;
      const sampleNotification = this.braintreeGateway.webhookTesting.sampleNotification(
        braintree.WebhookNotification.Kind.SubscriptionWentActive,
        id,
      );
      console.log(sampleNotification);
      return res.formatSend(200, { id, sampleNotification });
    };
  }
}
