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
} from '../features/posts/application/use-cases/content.create.post.use.case';
import { PostsQueryPrismaRepository } from '../features/posts/infrastructure/prisma/posts.prisma.query-repository';
import { RabbitConsumerService } from '../features/posts/application/rabbit.consumer.service';
import { UploadPhotoUseCase } from '../features/posts/application/use-cases/content.upload.photo';
import { ContentCreateCommentUseCase } from '../features/posts/application/use-cases/content.create.comment.use.case';
import { ContentGetPostsUseCase } from '../features/posts/application/use-cases/content.get.posts.use.case';
import { ContentGetPostUseCase } from '../features/posts/application/use-cases/content.get.post.use.case';
import { ContentDeletePostUseCase } from '../features/posts/application/use-cases/content.delete.post.use.case';
import { RabbitService } from '../features/posts/application/rabbit.service';
import { ContentPostLikeUseCase } from '../features/posts/application/use-cases/content.post.like.use.case';

const useCasesForPost = [
  ContentCreatePostUseCase,
  ContentDeletePostUseCase,
  ContentCreateCommentUseCase,
  ContentGetPostsUseCase,
  ContentGetPostUseCase,
  UploadPhotoUseCase,
  ContentPostLikeUseCase
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
  ],
})
export class AppModule { }
