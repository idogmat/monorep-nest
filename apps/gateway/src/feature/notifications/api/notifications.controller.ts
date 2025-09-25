import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { NotificationsRepository } from '../infrastrucrure/notifications.repository';
import { Payment } from '../../../../../libs/proto/generated/payments';
import { NotificationsSocket } from '../applications/notifications.socket';
import { findDiffDate } from '../applications/date.helper';



@Controller()
export class NotificationsController {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationsSocket: NotificationsSocket,
  ) {

  }
  // @EventPattern()
  // async handleNewSubscribe2(
  //   @Payload() data: any,
  //   @Ctx() context: RmqContext,
  // ) {
  //   const channel = context.getChannelRef();
  //   console.log(data, 'data')
  //   console.log(channel, 'channel')
  // }

  // @EventPattern('new_subscribe')
  // async handleNewSubscribe(
  //   @Payload() data: any,
  //   @Ctx() context: RmqContext,
  // ) {
  //   const channel = context.getChannelRef();
  //   const message = context.getMessage();
  //   try {
  //     console.log(data, 'new_subscribe')
  //     const payment: Payment = JSON.parse(Buffer.from(data.content).toString('utf-8'))
  //     await this.notificationsRepository.createNotificationBySubscribe(payment.userId, payment.expiresAt)
  //     const result = findDiffDate(payment?.expiresAt)
  //     this.notificationsSocket.sendNotifies(payment.userId, result, 'new_subscribe')
  //     // this.notificationsRepository.createNotificationBySubscribe(payment.userId, payment.expiresAt)
  //     channel.ack(message);
  //   } catch (error) {
  //     console.warn(error)
  //     // Сообщение, которое ты хочешь "отклонить" (msg из getMessage() или из RmqContext)
  //     // Если true, отклоняет все сообщения до этого включительно
  //     // Если true, сообщение будет заново поставлено в очередь. Если false — попадёт в dead-letter (если настроен) или будет утеряно
  //     channel.nack(message, false, false);
  //   }
  // }
}