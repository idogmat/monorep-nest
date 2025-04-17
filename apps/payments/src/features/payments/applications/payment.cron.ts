import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PaymentsRepository } from "../infrastructure/payments.repository";
import { Payment } from "../../../../prisma/generated/payments-client";
import { ClientProxy } from "@nestjs/microservices";
import { DelayRabbitService } from "./delay.rabbit.service";
@Injectable()
export class PaymentsCronService {
  private readonly logger = new Logger(PaymentsCronService.name);
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    @Inject('RABBITMQ_PAYMENTS_SERVICE') private readonly rabbitClient: ClientProxy,
    private readonly delayRabbitService: DelayRabbitService,


  ) { }
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    // this.delayRabbitService.publishWith30SecondsDelay('delay_payments_queue', { test: 'test' })
    // this.delayRabbitService.publishWith30SecondsDelay('delay_payments_queue', { test: 'test' })

    this.logger.log('Subscriptions update start');
    const { active, expired }: { active: Payment[]; expired: (Payment | undefined)[] } =
      await this.paymentsRepository.checkExpiers();
    let removeSub = expired.reduce((acc: string[], rem: Payment | undefined): string[] => {
      if (rem?.userId && !acc.includes(rem?.userId)) acc.push(rem.userId)
      return acc
    }, [] as string[])
    if (expired.length) {
      for (const exp of expired) {
        active?.forEach((act: Payment) => {
          if (act && act?.userId === exp.userId) {
            removeSub = removeSub.filter(e => e !== act?.userId)
          }
        })
        const { subscriptionId, customerId, expiresAt } = exp
        await this.paymentsRepository.markPaymentAsDeleted({
          subscriptionId,
          customerId,
          expiresAt: expiresAt?.toISOString(),
          deletedAt: new Date().toISOString()
        })
      }
    }
    if (removeSub.length) {
      const message = removeSub.map(e => ({ userId: e, paymentAccount: false }))
      this.rabbitClient.emit('update_profile_account', message)

    }
  }
}