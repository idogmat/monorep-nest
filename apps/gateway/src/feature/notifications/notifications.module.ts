import { Module } from '@nestjs/common';
import { NotificationsSocket } from './applications/notifications.socket';
import { NotificationsRepository } from './infrastrucrure/notifications.repository';
import { NotifySubscribeHandler } from './eventHandler/notify.handler';
import { PrismaService } from '../prisma/prisma.service';
import { RedisModule } from '../../support.modules/redis/redis.module';

@Module({
  imports: [
    RedisModule
  ],
  providers: [
    PrismaService,
    NotificationsSocket,
    NotificationsRepository,
    NotifySubscribeHandler,
  ],
  controllers: [],
  exports: [NotificationsSocket]
})
export class NotificationsModule { }