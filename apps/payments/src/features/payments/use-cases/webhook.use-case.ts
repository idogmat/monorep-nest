import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentsRepository } from '../infrastructure/payments.repository';
import { StripeAdapter } from '../applications/stripe.adapter';
import { products, productsName } from '../helpers';
import { Inject } from '@nestjs/common';
import { PaymentStatus } from '../../../../prisma/generated/payments-client';
import { DelayRabbitService } from '../applications/delay.rabbit.service';
import { ClientProxy } from '@nestjs/microservices';


export class WebHookPaymentCommand {
  constructor(
    public buffer: Buffer<ArrayBufferLike>,
    public signature: string,
  ) {
  }
}

@CommandHandler(WebHookPaymentCommand)
export class WebHookPaymentUseCase implements ICommandHandler<WebHookPaymentCommand> {

  constructor(
    @Inject("STRIPE_ADAPTER") private readonly stripeAdapter: StripeAdapter,
    private readonly paymentsRepository: PaymentsRepository,
    @Inject('DELAY_RABBIT_SERVICE') private readonly delayRabbitService: DelayRabbitService,
    @Inject('RABBITMQ_PROFILE_SERVICE') private readonly rabbitClient: ClientProxy
    // private readonly eventBus: EventBus
  ) { }

  async execute(command: WebHookPaymentCommand) {
    // console.log(command, 'command')
    const { buffer, signature } = command
    const event = await this.stripeAdapter.webHook(buffer, signature)
    // console.log(event, event.type)
    // console.log(JSON.stringify(event), event.type)
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
      case 'invoice.payment_succeeded':
        try {
          const {
            customer: customerId
          } = event.data.object
          const { subscriptionId } = (event.data.object as any)
          const status: PaymentStatus = event.data.object.status === 'paid' ? PaymentStatus.ACTIVE : PaymentStatus.CANCEL;
          const payment = {
            subscriptionId,
            status,
            customerId: typeof customerId === 'string' ? customerId : customerId.id
          }
          const sub = await this.paymentsRepository.updatePaymentStatus(payment)
          console.log(sub)
          // this.delayRabbitService.publish('payments_notify_queue', sub)
          this.delayRabbitService.publishWithDelay('payments_notify_queue', sub, 15000)

          this.rabbitClient.emit('update_profile_account', [{ userId: sub.userId, paymentAccount: true }])
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
        console.log(`Unhandled event type ${event.type}.`);

        break;
    }
  }


}