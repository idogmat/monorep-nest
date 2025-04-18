import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentsController } from './api/payments.controller';
import { UsersAccountsModule } from '../user-accounts/users.accounts.module';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GrpcServiceModule } from '../../support.modules/grpc/grpc.module';

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    UsersAccountsModule,
    GrpcServiceModule,
    ScheduleModule.forRoot(),
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
      }
    ])
  ],
  providers: [
    PrismaService,
  ],
  controllers: [PaymentsController],
  exports: []
})
export class PaymentsModule { }