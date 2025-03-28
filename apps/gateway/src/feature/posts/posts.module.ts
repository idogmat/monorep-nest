import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { PostsController } from './api/posts.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostsPrismaRepository } from './infrastructure/prisma/posts.prisma.repository';
import { CreatePostUseCases } from './application/use-cases/create.post.use.cases';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { DeviceService } from '../user-accounts/devices/application/device.service';
import { UploadPostPhotosUseCase } from './application/use-cases/upload.post.photos.use-case';
import { GateService } from '../../common/gate.service';


const useCasesForPost = [CreatePostUseCases, UploadPostPhotosUseCase]
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
        name: 'TCP_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.TCP,
            options: {
              host: configService.get('FILES_TCP'),
              port: configService.get('CONNECT_PORT'),  // Порт, на который отправляется запрос в Service B

            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('ACCESS_TOKEN'),
          signOptions: { expiresIn: configService.get('ACCESS_TOKEN_EXPIRATION') },
        };
      },
      inject: [ConfigService]
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
    ])
  ],
  providers: [
    PostsPrismaRepository,
    PrismaService,
    DeviceService,
    GateService,
    ...useCasesForPost
  ],
  controllers: [PostsController],
  exports: [HttpModule]
})
export class PostsModule { }