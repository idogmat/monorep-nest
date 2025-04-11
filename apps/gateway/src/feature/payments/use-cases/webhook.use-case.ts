import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentStatus } from '../../../../prisma/generated/client';
import { PaymentsRepository } from '../infrastructure/payments.repository';
import { StripeAdapter } from '../applications/stripe.adapter';
import { products, productsName } from '../helpers';
import { UpdateAccountEvent } from '../eventBus/updateAccount.event';
import { Inject } from '@nestjs/common';


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
    console.log(JSON.stringify(event), 'event')
    switch (event.type) {
      case 'customer.subscription.created':
        console.log(event.data.object)
        console.log(JSON.stringify(event.data.object), 'customer.subscription.created')
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
        console.log(event.data.object)
        console.log(JSON.stringify(event.data.object), 'customer.subscription.completed')
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
          console.log(event.data.object)
          await this.paymentsRepository.updatePaymentStatus(payment)
          this.eventBus.publish(new UpdateAccountEvent(userId, true));
        } catch {

        }

        break;

      case 'customer.subscription.updated':
        //   try {
        //     const {

        //       id: subscriptionId,
        //       expires_at,
        //       created,
        //       client_reference_id: userId
        //     } = event.data.object
        //     const planId = (event.data.object as any)?.plan?.id
        //     const customerId = (event.data.object as any)?.customer
        //     const payment = {
        //       subscriptionId,
        //       customerId,
        //       subType: productsName[planId],
        //       expiresAt: new Date(Date.now() * 1000).toISOString(),
        //       userId
        //     }
        //     const paymentExpire = {
        //       subscriptionId,
        //       customerId,
        //       subType: productsName[planId],
        //       expiresAt: new Date(Date.now() * 1000).toISOString(),
        //       userId
        //     }
        console.log(event.data.object)
        console.log(JSON.stringify(event.data.object), 'customer.subscription.updated')
        // await this.paymentsRepository.updatePaymentExpire(payment)
        // } catch {

        // }

        break;
      case 'customer.subscription.deleted':
        try {
          const { id, customer, canceled_at } = event.data.object

          // const result = await this.stripeAdapter.deleteSubscription(id)
          await this.paymentsRepository.markPaymentAsDeleted({
            subscriptionId: id,
            customerId: customer as string,
            deletedAt: new Date(canceled_at * 1000).toISOString()
          })
          // console.log(result)
        } catch {

        }
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
  }


}