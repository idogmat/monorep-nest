import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisModule } from '../../support.modules/redis/redis.module';
import { MessengerSocket } from './applications/messenger.socket';
import { ChatController } from './api/chat.controller';
import { ChatService } from './applications/chat.service';
import { GrpcServiceModule } from '../../support.modules/grpc/grpc.module';
import { RabbitService } from '../../support.modules/rabbit/rabbit.service';
import { RabbitConsumerService } from '../../support.modules/rabbit/rabbit.consumer.service';
import { ConfigService } from '@nestjs/config';
import { rabbitMessageHandler } from './applications/rabbit.messages.handler';

@Module({
  imports: [
    RedisModule,
    GrpcServiceModule
  ],
  providers: [
    PrismaService,
    MessengerSocket,
    ChatService,
    {
      provide: 'RABBIT_CONSUMER_SERVICE',
      useFactory: (configService: ConfigService) => {
        return new RabbitConsumerService(
          configService,
          'messenger_queue',
          rabbitMessageHandler
        );
      },
      inject: [ConfigService],
    },
  ],
  controllers: [
    ChatController
  ],
  exports: [MessengerSocket]
})
export class MessengerModule { }