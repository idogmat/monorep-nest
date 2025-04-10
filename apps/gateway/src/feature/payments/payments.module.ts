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

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    UsersAccountsModule
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
    PaymentsService,
    SubscribeUseCase
  ],
  controllers: [PaymentsController],
  exports: [PaymentsService]
})
export class PaymentsModule { }