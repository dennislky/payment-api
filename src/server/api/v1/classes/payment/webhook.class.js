
import braintree from 'braintree';

export default class {
  constructor({
    APIError,
    ErrorCode,
    gateway,
    ServicePlanModel,
    PaymentRecordModel,
  }) {
    Object.assign(this, {
      APIError,
      ErrorCode,
      gateway,
      ServicePlanModel,
      PaymentRecordModel,
    });
  }

  async subscriptionWentActive({ subscription }) {
    this.subscription = subscription;
    let servicePlan;
    let paymentRecord;
    let result;
    let braintreeResult;
    try {
      servicePlan = await this.ServicePlanModel.detail({ filter: {
        'shop.subscriptionId': subscription.id,
      } });
      console.log(this.subscription, servicePlan);
    } catch (err) {
      console.log(err);
      return false;
    }

    try {
      braintreeResult = await this.gateway.subscription.find(this.subscription.id);
      console.log(braintreeResult);
    } catch (err) {
      console.log(err);
      return false;
    }

    const paymentRecordData = {
      paymentItem: 'subscription_fee',
      merchant: servicePlan.merchant,
      amount: braintreeResult.price,
      referenceNo: 'N/A',
      status: 'paid',
      payTime: braintreeResult.updatedAt,
    };
    console.log(paymentRecordData);

    try {
      paymentRecord = await this.PaymentRecordModel.createPaymentRecord({
        paymentRecordData,
      });
      console.log(paymentRecord);
    } catch (err) {
      console.log(err);
      return false;
    }

    try {
      result = await this.ServicePlanModel.updateData({
        _id: servicePlan.id,
      }, {
        $push: { paymentRecord: paymentRecord.id },
      });
      console.log(result);
    } catch (err) {
      console.log(err);
      return false;
    }

    return true;
  }

  subscriptionAction() {
    return async (req, res) => {
      this.gateway.webhookNotification.parse(
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
      const sampleNotification = this.gateway.webhookTesting.sampleNotification(
        braintree.WebhookNotification.Kind.SubscriptionWentActive,
        id,
      );
      console.log(sampleNotification);
      return res.formatSend(200, { id, sampleNotification });
    };
  }
}
