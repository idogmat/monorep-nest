// src/app.module.ts
import { Module } from '@nestjs/common';
import { getConfiguration } from '../../../messenger/src/settings/getConfiguration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessagesPrismaRepository } from '../features/messages/infrastructure/prisma/messages.prisma.repository';
import { ChatsPrismaRepository } from '../features/chats/infrastructure/prisma/chats.prisma.repository';
import { MessagesQueryRepository } from '../features/messages/infrastructure/prisma/messages-query-repository.service';
import { ChatsQueryRepository } from '../features/chats/infrastructure/prisma/chats-query-repository.service';
import { CreateMessageUseCases } from '../features/messages/application/use-cases/create.message.use.case';
import { CreateChatUseCases } from '../features/chats/application/use-cases/create.chat.use.case';
import { PrismaService } from '../features/prisma/prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MessengerController } from '../features/api/messenger.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { GetChatByParticipantsUseCases } from '../features/chats/application/use-cases/get.chat.by.participants.use.case';
import { GetChatsUseCases } from '../features/chats/application/use-cases/get.chats.use.case';
import { RabbitConsumerService } from '../features/chats/application/rabbit.consumer.service';
import { CreateMessageWithFileUseCases } from '../features/messages/application/use-cases/create.message.with.file.use.case';
import { SendChatNotifyUseCases } from '../features/chats/application/use-cases/send.chat.notify.case';
import { RabbitService } from '../features/chats/application/rabbit.service';

const useCases = [
  GetChatsUseCases,
  CreateMessageUseCases,
  CreateChatUseCases,
  GetChatByParticipantsUseCases,
  CreateMessageWithFileUseCases,
  SendChatNotifyUseCases
];

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfiguration]
    }),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'MESSENGER_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.GRPC,
            options: {
              package: 'messenger',
              protoPath: join(__dirname, 'messenger.proto'),
              url: configService.get<string>('MESSENGER_GRPC_URL'),
            }
          }
        },
        inject: [ConfigService],
      },
    ])
  ],
  controllers: [MessengerController],
  providers: [
    PrismaService,
    MessagesPrismaRepository,
    MessagesQueryRepository,
    ChatsPrismaRepository,
    ChatsQueryRepository,
    RabbitConsumerService,
    {
      provide: 'RABBIT_SERVICE',
      useFactory: (configService: ConfigService) => {
        return new RabbitService(
          configService,
        );
      },
      inject: [ConfigService],
    },
    ...useCases
  ],
  exports: [],
})
export class AppModule { }
