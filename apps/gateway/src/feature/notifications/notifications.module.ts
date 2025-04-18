import { Module } from '@nestjs/common';
import { NotificationsSocket } from './applications/notifications.socket';
import { NotificationsRepository } from './infrastrucrure/notifications.repository';
import { PrismaService } from '../prisma/prisma.service';
import { RedisModule } from '../../support.modules/redis/redis.module';
import { NotificationsController } from './api/notifications.controller';

@Module({
  imports: [
    RedisModule
  ],
  providers: [
    PrismaService,
    NotificationsSocket,
    NotificationsRepository,
  ],
  controllers: [NotificationsController],
  exports: [NotificationsSocket]
})
export class NotificationsModule { }