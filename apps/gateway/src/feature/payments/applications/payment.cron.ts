import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PaymentsRepository } from "../infrastructure/payments.repository";
import { EventBus } from "@nestjs/cqrs";
import { UpdateAccountEvent } from "../eventBus/updateAccount.event";

@Injectable()
export class PaymentCronService {
  private readonly logger = new Logger(PaymentCronService.name);
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly eventBus: EventBus
  ) { }
  // "*/10 * * * * *" 10sec
  @Cron(CronExpression.EVERY_10_MINUTES) // Каждые 10 минут
  async handleCron() {
    const { active, expired } = await this.paymentsRepository.checkExpiers()
    let removeSub = expired.map((rem, _, array) => {
      if (!array.includes(rem.userId)) return rem.userId
    }
    )
    // console.log(active)
    // console.log(expired)

    if (expired.length) {
      for (const exp of expired) {
        active?.forEach(act => {
          if (act?.userId === exp.userId) {
            removeSub = removeSub.filter(e => e !== act?.userId)
          }
        })
        const { subscriptionId, customerId, expiresAt } = exp
        this.paymentsRepository.markPaymentAsDeleted({
          subscriptionId,
          customerId,
          expiresAt: expiresAt?.toISOString(),
          deletedAt: new Date().toISOString()
        })
      }
    }
    if (removeSub.length) {
      // console.log(removeSub)
      for (const r of removeSub) {
        this.eventBus.publish(new UpdateAccountEvent(r, false));
      }

      this.logger.log('Subscriptions updated');
    }
  }
}