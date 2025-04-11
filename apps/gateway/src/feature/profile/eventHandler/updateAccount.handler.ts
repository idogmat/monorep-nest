import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UpdateAccountEvent } from '../../payments/eventBus/updateAccount.event';
import { ProfileClientService } from '../../../support.modules/grpc/grpc.service';

@EventsHandler(UpdateAccountEvent)
export class UpdateAccountHandler implements IEventHandler<UpdateAccountEvent> {
  constructor(
    private readonly profileClientService: ProfileClientService,

  ) { }
  async handle(event: UpdateAccountEvent) {
    const { userId, paymentAccount } = event
    this.profileClientService.updateUserProfileSubscribe(userId, paymentAccount)
    // Здесь можно, например, отправить письмо или логировать
  }
}