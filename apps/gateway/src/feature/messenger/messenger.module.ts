import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisModule } from '../../support.modules/redis/redis.module';
import { MessengerSocket } from './applications/messenger.socket';

@Module({
  imports: [
    RedisModule,
  ],
  providers: [
    PrismaService,
    MessengerSocket,
  ],
  controllers: [],
  exports: [MessengerSocket]
})
export class MessengerModule { }