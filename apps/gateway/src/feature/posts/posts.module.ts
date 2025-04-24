import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { PostsController } from './api/posts.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CreatePostUseCases } from './application/use-cases/create.post.use.cases';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { DeviceService } from '../user-accounts/devices/application/device.service';
import { GateService } from '../../common/gate.service';
import { PostMicroserviceService } from './application/services/post.microservice.service';

const useCasesForPost = [
  CreatePostUseCases]
@Module({
  imports: [
    HttpModule,
    CqrsModule,
    MulterModule.register({
      dest: './uploads',
    }),
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
    ])
  ],
  providers: [
    PrismaService,
    DeviceService,
    GateService,
    PostMicroserviceService,
    ...useCasesForPost
  ],
  controllers: [PostsController],
  exports: [HttpModule]
})
export class PostsModule { }