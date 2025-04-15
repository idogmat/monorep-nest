import { Controller, Get, Headers, Post, Req } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentsService } from '../applications/payments.service';
import { PaymentsRepository } from '../infrastructure/payments.repository';
import { CommandBus } from '@nestjs/cqrs';
import { GetSubscribesQuery, UnSubscribeRequest, UserForSubscribe, WebhookRequest } from '../../../../../libs/proto/generated/payments';
import { PaymentsQueryRepository } from '../infrastructure/payments.query-repository';
import { WebHookPaymentCommand } from '../use-cases/webhook.use-case';
import { SubscribeCommand } from '../use-cases/subscribe.use-case';


@Controller()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentsQueryRepository: PaymentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {

  }

  @GrpcMethod('PaymentsService', 'CreateSubscribe')
  async createSubscribe(data: { user: UserForSubscribe, productKey: number }) {
    try {
      const { user, productKey } = data

      return await this.commandBus.execute(new SubscribeCommand(user, productKey))
    } catch (error) {
      console.log(error)
      return { url: '', status: 'fail' }
    }

  }

  @GrpcMethod('PaymentsService', 'GetSubscribes')
  async getSubscribes(data: GetSubscribesQuery) {
    try {
      console.log(data)

      const result = await this.paymentsQueryRepository.getAllPayments(data)
      console.log(result)
      return result
    } catch (error) {
      console.log(error)
      return { url: '', status: 'fail' }
    }

  }

  @GrpcMethod('PaymentsService', 'UnSubscribe')
  async UnSubscribe(data: UnSubscribeRequest) {
    try {
      console.log(data)
      const { userId, paymentId } = data;
      const result = await this.paymentsService.deletePayment(userId, paymentId)
      console.log(result)
      return result
    } catch (error) {
      console.log(error)
      return { url: '', status: 'fail' }
    }
  }

  @GrpcMethod('PaymentsService', 'Webhook')
  async WebHook(data: WebhookRequest) {
    try {
      console.log(data, 'data')
      const { buffer, signature } = data;
      await this.commandBus.execute(new WebHookPaymentCommand(buffer as any, signature))
      // console.log(result)
      return 'result'
    } catch (error) {
      console.log(error)
      return { status: 'fail' }
    }
  }

}