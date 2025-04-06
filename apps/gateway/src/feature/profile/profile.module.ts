import { Module } from '@nestjs/common';
import { ProfileController } from './api/profile.controller';
import { ProfileService } from './application/profile.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { DeviceService } from '../user-accounts/devices/application/device.service';
import { PrismaService } from '../prisma/prisma.service';
import { GateService } from '../../common/gate.service';
import { ProfileMappingService } from './application/profile.mapper';

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
    GateService
  ],
  controllers: [ProfileController],
  exports: []
})
export class ProfileModule { }