import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentStatus } from '../../../../prisma/generated/client';
import { PaymentsRepository } from '../infrastructure/payments.repository';
import { StripeAdapter } from '../applications/stripe.adapter';
import { products, productsName } from '../helpers';
import { UpdateAccountEvent } from '../eventBus/updateAccount.event';
import { Inject } from '@nestjs/common';
import { NotifySubscribeEvent } from '../eventBus/notify.event';


export class WebhookCommand {
  constructor(
    public buffer: Buffer<ArrayBufferLike>,
    public signature: string,
  ) {
  }
}

@CommandHandler(WebhookCommand)
export class WebhookUseCase implements ICommandHandler<WebhookCommand> {

  constructor(
    @Inject("STRIPE_ADAPTER") private readonly stripeAdapter: StripeAdapter,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly eventBus: EventBus
  ) { }

  async execute(command: WebhookCommand) {

    const { buffer, signature } = command
    const event = await this.stripeAdapter.webHook(buffer, signature)
    // console.log(event)

    switch (event.type) {
      case 'customer.subscription.created':
        try {
          const {
            id: subscriptionId,
            customer,
          } = event.data.object
          const object = event.data.object.items?.data?.[0]
          const priceId = object.plan.id
          const { current_period_start, current_period_end, } = object
          const payment = {
            subscriptionId,
            createdAt: new Date(current_period_start * 1000).toISOString(),
            expiresAt: new Date(current_period_end * 1000).toISOString(),
            customerId: customer as string,
            subType: productsName[priceId],
            amount: Object.values(products).find(p => p.price === priceId)?.amount
          }
          await this.paymentsRepository.updatePayment(payment)
        } catch {

        }
        break;
      case 'checkout.session.completed':
        try {
          const {
            client_reference_id: userId
          } = event.data.object
          const subscriptionId = (event.data.object as any).subscription
          const status: PaymentStatus = event.data.object.status === 'complete' ? PaymentStatus.ACTIVE : PaymentStatus.CANCEL;
          const payment = {
            subscriptionId,
            status,
            userId
          }
          const sub = await this.paymentsRepository.updatePaymentStatus(payment)
          console.log(sub, 'sub')
          this.eventBus.publish(new UpdateAccountEvent([{ userId, paymentAccount: true }]));
          this.eventBus.publish(new NotifySubscribeEvent({ userId, expiresAt: sub.expiresAt?.toISOString() }));
        } catch {

        }

        break;

      case 'customer.subscription.updated':
        try {
          const {
            id: subscriptionId,
          } = event.data.object
          const object = event.data.object.items?.data?.[0]
          const { current_period_end, } = object

          const payment = {
            subscriptionId,
            expiresAt: new Date(current_period_end * 1000).toISOString(),
          }
          await this.paymentsRepository.updatePaymentExpire(payment)
        } catch {

        }

        break;
      case 'customer.subscription.deleted':
        try {
          const { id, customer, canceled_at } = event.data.object

          const object = event.data.object.items?.data?.[0]
          const { current_period_end, } = object
          const payment = {
            subscriptionId: id,
            expiresAt: new Date(current_period_end * 1000).toISOString(),
            deletedAt: new Date(canceled_at * 1000).toISOString(),
            customerId: customer as string,
          }
          await this.paymentsRepository.markPaymentAsDeleted(payment)
        } catch {

        }
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
  }


}