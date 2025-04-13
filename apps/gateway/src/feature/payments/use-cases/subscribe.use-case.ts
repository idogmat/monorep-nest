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
      return { url }
    } catch (error) {
      console.log(error)
    }

  }
}