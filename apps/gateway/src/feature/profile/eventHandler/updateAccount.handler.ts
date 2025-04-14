import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UpdateAccountEvent } from '../../payments/eventBus/updateAccount.event';
import { FileService } from '../../../../../libs/file.service';

@EventsHandler(UpdateAccountEvent)
export class UpdateAccountHandler implements IEventHandler<UpdateAccountEvent> {
  constructor(
    private readonly fileService: FileService,
  ) {

  }
  async handle(event: UpdateAccountEvent) {
    await this.fileService.appendToJsonFile(event.users)
  }
}