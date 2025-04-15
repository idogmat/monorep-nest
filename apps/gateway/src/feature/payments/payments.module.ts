import { Module } from '@nestjs/common';
import { StripeAdapter } from './applications/stripe.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentsService } from './applications/payments.service';
import { PaymentsController } from './api/payments.controller';
import { UsersAccountsModule } from '../user-accounts/users.accounts.module';
import { SubscribeUseCase } from './use-cases/subscribe.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsRepository } from './infrastructure/payments.repository';
import { WebhookUseCase } from './use-cases/webhook.use-case';
import { PaymentCronService } from './applications/payment.cron';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentsQueryRepository } from './infrastructure/payments.query-repository';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    UsersAccountsModule,
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
              queueOptions: { durable: false },
            },
          }
        },
        inject: [ConfigService],
      }
    ])
  ],
  providers: [
    {
      provide: 'STRIPE_ADAPTER',
      useFactory: (configService: ConfigService) => {
        return new StripeAdapter(
          configService,
        );
      },
      inject: [ConfigService],
    },
    PrismaService,
    PaymentsRepository,
    PaymentsQueryRepository,
    PaymentsService,
    SubscribeUseCase,
    WebhookUseCase,
    PaymentCronService,

  ],
  controllers: [PaymentsController],
  exports: [PaymentsService]
})
export class PaymentsModule { }