import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getConfiguration } from '../../../profile/src/settings/getConfiguration';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ContentController } from './content.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { PostsPrismaRepository } from '../features/posts/infrastructure/prisma/posts.prisma.repository';
import { PrismaService } from '../features/prisma/prisma.service';
import {

  ContentCreatePostUseCase,
} from '../features/posts/application/use-cases/content.create.post.use.cases';
import { ContentGetPostUseCase } from '../features/posts/application/use-cases/content.get.post.use.case';
import { PostsQueryPrismaRepository } from '../features/posts/infrastructure/prisma/posts.prisma.query-repository';
import { RabbitConsumerService } from '../features/posts/application/rabbit.consumer.service';
import { UploadPhotoUseCase } from '../features/posts/application/use-cases/content.upload.photo';

const useCasesForPost = [
  ContentCreatePostUseCase,
  ContentGetPostUseCase,
  UploadPhotoUseCase
]
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
        name: 'RABBITMQ_CONTENT_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: configService.get<string[]>('RABBIT_URLS'),
              queue: 'content_queue',
              queueOptions: { durable: true },
            },
          }
        },
        inject: [ConfigService],
      },
      {
        imports: [ConfigModule],
        name: 'CONTENT_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.GRPC,
            options: {
              package: 'content',
              protoPath: join(__dirname, 'content.proto'),
              url: configService.get<string>('CONTENT_GRPC_URL'),
            }
          }
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [
    ContentController
  ],
  providers: [
    ...useCasesForPost,
    PostsPrismaRepository,
    PostsQueryPrismaRepository,
    PrismaService,
    RabbitConsumerService
  ],
})
export class AppModule { }
