import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentsService } from '../applications/payments.service';
import { PaymentsRepository } from '../infrastructure/payments.repository';
import { PaymentsClientService } from '../../../support.modules/grpc/grpc.payments.service';
import { UsersService } from '../../user-accounts/users/application/users.service';


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
    private readonly paymentsClientService: PaymentsClientService,
    private readonly usersService: UsersService,

  ) { }

  async execute(command: SubscribeCommand) {
    try {
      const { userId, productkey } = command;
      const { id, email, name } = await this.usersService.findById(userId);
      const user = { id, email, name }
      const result = await this.paymentsClientService.createSubscribe(user, productkey);
      console.log(result)

      return { result }
    } catch (error) {
      console.log(error)
    }

  }
}