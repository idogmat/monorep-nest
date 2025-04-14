import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaService } from "../features/prisma/prisma.service";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ScheduleModule } from "@nestjs/schedule";
import { WebhookUseCase } from "../features/use-cases/webhook.use-case";
import { SubscribeUseCase } from "../features/use-cases/subscribe.use-case";
import { StripeAdapter } from "../features/applications/stripe.adapter";
import { PaymentsRepository } from "../features/infrastructure/payments.repository";
import { PaymentsQueryRepository } from "../features/infrastructure/payments.query-repository";
import { PaymentsService } from "../features/applications/payments.service";
import { PaymentCronService } from "../features/applications/payment.cron";
import { AppController } from "./app.controller";
import { getConfiguration } from "../settings/getConfiguration";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfiguration]
    }),
    CqrsModule,
    ScheduleModule.forRoot(),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'RABBITMQ_PAYMENTS_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: configService.get<string[]>('RABBIT_URLS'),
              queue: 'payments_queue',
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
    PaymentCronService
  ],
  controllers: [AppController],
})
export class AppModule { }
