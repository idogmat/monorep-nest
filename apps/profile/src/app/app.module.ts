// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getConfiguration } from '../settings/getConfiguration';
import { PrismaService } from '../features/prisma/prisma.service';
import { ProfileService } from '../features/profile.service';
import {
  PostMediaUploadListener
} from '../../../gateway/src/feature/posts/infrastructure/rabbitMQ/post.media.upload.listener';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfiguration]
    }),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'RABBITMQ_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: configService.get<string[]>('RABBIT_URLS'),
              queue: 'file_queue',
              queueOptions: { durable: false },
            },
          }
        },
        inject: [ConfigService],
      },
    ]),

  ],
  controllers: [AppController],
  providers: [PrismaService, ProfileService, PostMediaUploadListener],
  exports: [],
})
export class AppModule { }
