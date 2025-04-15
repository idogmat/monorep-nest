import { Controller, Get, Headers, Post, Req } from '@nestjs/common';

import { CommandBus } from '@nestjs/cqrs';
import { WebhookCommand } from '../use-cases/webhook.use-case';


@Controller('payments')
export class PaymentsController {
  constructor(

    private readonly commandBus: CommandBus,
  ) {

  }


  @Get()
  async hello(
    @Req() req,
  ) {
    return 'ok'
  }


  @Post('webhook')
  async webHook(
    @Req() req,
    @Headers('stripe-signature') signature
  ) {
    console.log('ebt')
    if (signature)
      this.commandBus.execute(
        new WebhookCommand(req.rawBody, signature)
      );
  }

}