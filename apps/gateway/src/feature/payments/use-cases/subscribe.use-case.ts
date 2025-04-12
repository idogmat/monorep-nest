import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentsService } from '../applications/payments.service';
import { PaymentsRepository } from '../infrastructure/payments.repository';


export class SubscribeCommand {
  constructor(
    public userId: string,
    public productkey: number,
  ) {
  }
}

@CommandHandler(SubscribeCommand)
export class SubscribeUseCase implements ICommandHandler<SubscribeCommand> {

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentsRepository: PaymentsRepository

  ) { }

  async execute(command: SubscribeCommand) {
    try {
      const { userId, productkey } = command
      const customer = await this.paymentsService.findOrCreateCustomer(userId)
      // const subscriptions = await this.paymentsService.listCustomerSubscriptions(customer.id)
      // console.log(subscriptions, 'subscriptions')
      // if (subscriptions.data?.[0]?.id) {
      //   const updatedSubscription = await this.paymentsService.updatePayment(
      //     subscriptions.data?.[0]?.id,
      //     productkey,
      //   )
      //   // current_period_end
      //   // const price = updatedSubscription.items.data[0]
      //   console.log(JSON.stringify(updatedSubscription), 'updatedSubscription')
      //   // console.log(price, 'price')
      // } else {
      const {
        created,
        client_reference_id: referenceUserId,
        url
      } = await this.paymentsService.createPayment(
        customer,
        productkey,
        userId
      )
      const payment = {
        createdAt: new Date(created * 1000).toISOString(),
        customerId: customer.id,
        userId: referenceUserId
      }
      console.log(url)
      const ppp = await this.paymentsRepository.createPayment(payment)
      console.log(ppp, 'ppp')
      return { url }
      // }
      return 'ok'
    } catch (error) {
      console.log(error)
    }

  }
}