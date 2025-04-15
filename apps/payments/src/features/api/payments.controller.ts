import { Controller, Get, Headers, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';

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
  @HttpCode(200)
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