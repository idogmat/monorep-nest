import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PaymentsRepository } from "../infrastructure/payments.repository";
import { EventBus } from "@nestjs/cqrs";
import { UpdateAccountEvent } from "../eventBus/updateAccount.event";
import { Payment } from "../../../prisma/generated/payments-client";

@Injectable()
export class PaymentCronService {
  private readonly logger = new Logger(PaymentCronService.name);
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly eventBus: EventBus
  ) { }
  // "*/10 * * * * *" 10sec
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    const { active, expired }: { active: Payment[]; expired: (Payment | undefined)[] } =
      await this.paymentsRepository.checkExpiers();
    let removeSub = expired.reduce((acc: string[], rem: Payment | undefined): string[] => {
      if (rem?.userId && !acc.includes(rem?.userId)) acc.push(rem.userId)
      return acc
    }, [] as string[])
    console.log(active)
    console.log(expired)

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
      this.eventBus.publish(new UpdateAccountEvent(message));

      this.logger.log('Subscriptions updated');
    }
  }
}