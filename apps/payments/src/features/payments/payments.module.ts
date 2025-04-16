import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { SubscribeUseCase } from "./use-cases/subscribe.use-case";
import { WebHookPaymentUseCase } from "./use-cases/webhook.use-case";
import { getConfiguration } from "../../settings/getConfiguration";
import { StripeAdapter } from "./applications/stripe.adapter";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentsRepository } from "./infrastructure/payments.repository";
import { PaymentsQueryRepository } from "./infrastructure/payments.query-repository";
import { PaymentsService } from "./applications/payments.service";
import { PaymentsController } from "./api/app.controller";
import { PaymentsCronService } from "./applications/payment.cron";
import { ScheduleModule } from "@nestjs/schedule";
import { DelayRabbitService } from "./applications/delay.rabbit.service";



const useCases = [
  SubscribeUseCase,
  WebHookPaymentUseCase
]
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfiguration]
    }),
    CqrsModule,
    ScheduleModule.forRoot(),
    ClientsModule.registerAsync([
      // {
      //   imports: [ConfigModule],
      //   name: 'RABBITMQ_PAYMENTS_SERVICE',
      //   useFactory: (configService: ConfigService) => {
      //     return {
      //       transport: Transport.RMQ,
      //       options: {
      //         urls: configService.get<string[]>('RABBIT_URLS'),
      //         queue: 'payments_queue',
      //         queueOptions: { durable: true },
      //       },
      //     }
      //   },
      //   inject: [ConfigService],
      // }
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
    PaymentsCronService,
    DelayRabbitService,
    ...useCases,

  ],
  controllers: [PaymentsController],
})
export class PaymentsModule { }
