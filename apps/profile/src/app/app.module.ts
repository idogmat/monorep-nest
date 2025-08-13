// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getConfiguration } from '../settings/getConfiguration';
import { PrismaService } from '../features/prisma/prisma.service';
import { ProfileService } from '../features/profile.service';
import { join } from 'path';
import { RabbitConsumerService } from '../features/application/rabbit.consumer.service';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfiguration]
    }),
    CqrsModule,
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'RABBITMQ_PROFILE_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: configService.get<string[]>('RABBIT_URLS'),
              queue: 'profile_queue',
              queueOptions: { durable: true },
            },
          }
        },
        inject: [ConfigService],
      },
      {
        imports: [ConfigModule],
        name: 'PROFILE_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.GRPC,
            options: {
              package: 'profile',
              protoPath: join(__dirname, 'profile.proto'),
              url: configService.get<string>('PROFILE_GRPC_URL'), //TODO
            }
          }
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [
    AppController
  ],
  providers: [
    PrismaService,
    ProfileService,
    RabbitConsumerService
  ],
  exports: [],
})
export class AppModule { }
