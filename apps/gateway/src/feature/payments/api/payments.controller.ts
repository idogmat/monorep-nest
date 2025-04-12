import { BadRequestException, Body, Controller, Get, Header, Headers, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentsService } from '../applications/payments.service';
import { CommandBus } from '@nestjs/cqrs';
import { SubscribeCommand } from '../use-cases/subscribe.use-case';
import { WebhookCommand } from '../use-cases/webhook.use-case';
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly commandBus: CommandBus,
  ) { }

  // TODO POST AUARD
  @Get('subscribe/:id')
  async subscribePayment(
    @Req() req: Request,
    @Param('id') id: string
    // @Body() 
    // @Res() res
  ) {
    // console.log(req.user.userId)
    const userId = id || 'acf7924f-310f-40ec-bd2b-fc6382c337a2'
    const product = 1
    if (![1, 2, 3].includes(product)) throw new BadRequestException({ message: 'Wrong product key' })
    return this.commandBus.execute(
      new SubscribeCommand(userId, 1)
    );
  }

  // TODO POST AUARD
  @Get('unsubscribe/:id')
  async unsubscribePayment(
    @Req() req: Request,
    @Param('id') id: string
    // @Body() 
    // @Res() res
  ) {
    // console.log(req.user.userId)
    const userId = id || 'acf7924f-310f-40ec-bd2b-fc6382c337a2'
    const paymentId = req.user?.userId || 'a19ec874-aa69-4fbc-a3b4-4cc022f229bc'
    const subscriptions = await this.paymentsService.deletePayment(id)

  }

  // @Get('subscriptions/update')
  // async updatePayment(
  //   @Req() req
  // ) {
  //   const userId = req.user?.userId || 'acf7924f-310f-40ec-bd2b-fc6382c337a2'

  //   const subscriptions = await this.paymentsService.updatePayment(userId, 1)
  //   return subscriptions
  // }

  @Get('subscriptions')
  async getSubscriptions(
    @Req() req,
    @Param('id') id: string
  ) {
    const userId = id || 'acf7924f-310f-40ec-bd2b-fc6382c337a2'

    const result = await this.paymentsService.findCustomerByUserId(userId)
    // return result
    const subscriptions = await this.paymentsService.listCustomerSubscriptions(result.id)
    return subscriptions
  }



  @Post('webhook')
  async webHook(
    @Req() req,
    @Headers('stripe-signature') signature
  ) {
    if (signature)
      this.commandBus.execute(
        new WebhookCommand(req.rawBody, signature)
      );
  }

}
