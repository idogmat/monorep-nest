import { Module } from '@nestjs/common';
import { ProfileController } from './api/profile.controller';
import { ProfileService } from './application/profile.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'RABBITMQ_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: configService.get<string[]>('RABBIT_URLS'),
              queue: 'test_queue',
              queueOptions: { durable: false },
            },
          }
        },
        inject: [ConfigService],
      },
    ])],
  providers: [ProfileService],
  controllers: [ProfileController],
  exports: []
})
export class ProfileModule { }