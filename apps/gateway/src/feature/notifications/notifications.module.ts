import { Module } from '@nestjs/common';
import { NotificationsSocket } from './applications/notifications.socket';
import { NotificationsRepository } from './infrastrucrure/notifications.repository';
import { PrismaService } from '../prisma/prisma.service';
import { RedisModule } from '../../support.modules/redis/redis.module';
import { NotificationsController } from './api/notifications.controller';
import { RabbitConsumerService } from '../../support.modules/rabbit/rabbit.consumer.service';
import { ConfigService } from '@nestjs/config';
import { createRabbitMessageHandler } from './applications/rabbit.messages.handler';

@Module({
  imports: [RedisModule],
  providers: [
    PrismaService,
    NotificationsSocket,
    NotificationsRepository,
    {
      provide: 'RABBIT_CONSUMER_SERVICE',
      useFactory: (
        configService: ConfigService,
        notificationsRepository: NotificationsRepository,
        notificationsSocket: NotificationsSocket
      ) => {
        const handler = createRabbitMessageHandler(
          notificationsRepository,
          notificationsSocket.sendPaymentNotifies.bind(notificationsSocket)
        );

        return new RabbitConsumerService(
          configService,
          'payments_notify_queue',
          handler
        );
      },
      inject: [ConfigService, NotificationsRepository, NotificationsSocket],
    },
  ],
  controllers: [NotificationsController],
  exports: [NotificationsSocket],
})
export class NotificationsModule { }
