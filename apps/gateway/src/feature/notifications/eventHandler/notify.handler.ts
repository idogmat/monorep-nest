import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NotifySubscribeEvent } from '../../payments/eventBus/notify.event';
import { NotificationsRepository } from '../infrastrucrure/notifications.repository';

@EventsHandler(NotifySubscribeEvent)
export class NotifySubscribeHandler implements IEventHandler<NotifySubscribeEvent> {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {

  }
  async handle(event: NotifySubscribeEvent) {
    const { userId, expiresAt } = event.notify
    console.log(event)
    await this.notificationsRepository.createNotificationBySubscribe(userId, expiresAt)
    // await this.fileService.appendToJsonFile(event.users)
  }
}