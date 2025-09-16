// src/app.module.ts
import { Module } from '@nestjs/common';
import { getConfiguration } from '../../../messenger/src/settings/getConfiguration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessagesPrismaRepository } from '../features/messages/infrastructure/prisma/messages.prisma.repository';
import { ChatsPrismaRepository } from '../features/chats/infrastructure/prisma/chats.prisma.repository';
import { MessagesQueryRepository } from '../features/messages/infrastructure/prisma/messages-query-repository.service';
import { ChatsQueryRepository } from '../features/chats/infrastructure/prisma/chats-query-repository.service';
import { CreateMessageUseCases } from '../features/messages/application/use-cases/create.chat.use.case';
import { CreateChatUseCases } from '../features/chats/application/use-cases/create.chat.use.case';
import { PrismaService } from '../features/prisma/prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MessengerController } from '../features/api/messenger.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { GetChatByParticipantsUseCases } from '../features/chats/application/use-cases/get.chat.by.participants.use.case';

const useCases = [
  CreateMessageUseCases,
  CreateChatUseCases,
  GetChatByParticipantsUseCases
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
    ...useCases
  ],
  exports: [],
})
export class AppModule { }
