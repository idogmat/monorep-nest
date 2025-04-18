import { Module } from '@nestjs/common';
import { ProfileController } from './api/profile.controller';
import { ProfileService } from './application/profile.service';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { DeviceService } from '../user-accounts/devices/application/device.service';
import { PrismaService } from '../prisma/prisma.service';
import { GateService } from '../../common/gate.service';
import { ProfileMappingService } from './application/profile.mapper';
import { GrpcServiceModule } from '../../support.modules/grpc/grpc.module';
import { FileService } from '../../../../libs/file.service';

@Module({
  imports: [
    HttpModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('ACCESS_TOKEN'),
          signOptions: { expiresIn: configService.get('ACCESS_TOKEN_EXPIRATION') },
        };
      },
      inject: [ConfigService]
    }),
    GrpcServiceModule
    // ClientsModule.registerAsync([
    //   {
    //     imports: [ConfigModule],
    //     name: 'RABBITMQ_SERVICE',
    //     useFactory: (configService: ConfigService) => {
    //       return {
    //         transport: Transport.RMQ,
    //         options: {
    //           urls: configService.get<string[]>('RABBIT_URLS'),
    //           queue: 'file_queue',
    //           queueOptions: { durable: false },
    //         },
    //       }
    //     },
    //     inject: [ConfigService],
    //   },
    // ])
  ],
  providers: [
    ProfileService,
    DeviceService,
    ProfileMappingService,
    PrismaService,
    GateService,
    FileService,
  ],
  controllers: [ProfileController],
  exports: []
})
export class ProfileModule { }