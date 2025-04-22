import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostsController } from './api/posts.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';
import { PostsPrismaRepository } from './infrastructure/prisma/posts.prisma.repository';
import { PostsQueryRepository } from './infrastructure/prisma/posts-query-repository.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostUseCases } from './application/use-cases/create.post.use.cases';
import { UploadPostPhotosUseCase } from './application/use-cases/upload.post.photos.use-case';
import {
  UpdatePostStatusOnFileUploadUseCases
} from './application/use-cases/update.post.status.on.file.upload.use-case';
import { GetPostAndPhotoUseCase } from './application/use-cases/get.post.and.photo.use-case';
import { GetAllPostsUseCase } from './application/use-cases/get.all.posts.use-case';
import { UpdatePostUseCase } from './application/use-cases/update.post.use-case';
import { DeletePostUseCase } from './application/use-cases/delete.post.use-case';
import { GateService } from '../../../../gateway/src/common/gate.service';


const useCasesForPost = [
  CreatePostUseCases,
  UploadPostPhotosUseCase,
  UpdatePostStatusOnFileUploadUseCases,
  GetPostAndPhotoUseCase,
  GetAllPostsUseCase,
  UpdatePostUseCase,
  DeletePostUseCase]
@Module({
  imports: [
    HttpModule,
    CqrsModule,
    MulterModule.register({
      dest: './uploads',
    }),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'RABBITMQ_POST_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: configService.get<string[]>('RABBIT_URLS'),
              queue: 'file_queue',
              queueOptions: { durable: true },
            },
          }
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    ...useCasesForPost,
    PostsPrismaRepository,
    PostsQueryRepository,
    PrismaService,
    GateService
  ],
  controllers: [PostsController],
  exports: [HttpModule]
})
export class PostModule { }
