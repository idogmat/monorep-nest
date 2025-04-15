import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentsService } from '../applications/payments.service';
import { PaymentsRepository } from '../infrastructure/payments.repository';
import { UserForSubscribe } from '../../../../../libs/proto/generated/payments';


export class SubscribeCommand {
  constructor(
    public user: UserForSubscribe,
    public productKey: number,
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
      const { user, productKey } = command
      const customer = await this.paymentsService.findOrCreateCustomer(user)
      const {
        created,
        client_reference_id: referenceUserId,
        url
      } = await this.paymentsService.activateSubscribe(
        customer,
        productKey,
        user.id
      )
      const payment = {
        createdAt: new Date(created * 1000).toISOString(),
        customerId: customer.id,
        userId: referenceUserId
      }
      console.log(url)
      await this.paymentsRepository.createPayment(payment)
      return { url, status: 'ok' }
    } catch (error) {
      console.log(error)
      return { url: '', status: 'fail' }
    }

  }
}