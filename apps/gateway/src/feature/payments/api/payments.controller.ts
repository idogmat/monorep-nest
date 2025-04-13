import { BadRequestException, Body, Controller, ForbiddenException, Get, Headers, HttpCode, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from '../applications/payments.service';
import { CommandBus } from '@nestjs/cqrs';
import { SubscribeCommand } from '../use-cases/subscribe.use-case';
import { WebhookCommand } from '../use-cases/webhook.use-case';
import { AuthGuard } from '../../../../src/common/guard/authGuard';
import { SubscribeDto, SubscribeProductDto } from './model/input/input.subscribe';
import { PaginationPaymentsQueryDto } from './model/input/pagination.query';
import { PaginationSearchPaymentsTerm } from './model/input/payments.query.model';
import { PaymentsQueryRepository } from '../infrastructure/payments.query-repository';
import { mapToViewModel, PagedResponseOfPayments } from './model/output/paged.payments.model';
import { ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PaymentUrlModel } from './model/output/url.model';
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentsQueryRepository: PaymentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) { }

  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Create payment url',
    type: PaymentUrlModel
  })
  @UseGuards(AuthGuard)
  @Post('subscribe')
  async subscribePayment(
    @Req() req: Request,
    @Body() payload: SubscribeProductDto

  ) {
    const userId = req.user?.userId
    const product = payload.subscribeType
    if (![1, 2, 3].includes(product)) throw new BadRequestException({ message: 'Wrong product key' })
    return this.commandBus.execute(
      new SubscribeCommand(userId, product)
    );
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Successfully unsubscribed',
  })
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @Post('unsubscribe')
  async unsubscribePayment(
    @Req() req: Request,
    @Body() payload: SubscribeDto

  ) {
    const userId = req.user?.userId
    const paymentId = payload.paymentId
    await this.paymentsService.deletePayment(userId, paymentId)

  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched payments',
    type: PagedResponseOfPayments,
  })
  @ApiQuery({ name: 'pageNumber', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortDirection', required: false })
  @UseGuards(AuthGuard)
  @Get('subscriptions')
  async getSubscriptions(
    @Req() req,
    @Query() queryDTO: PaginationPaymentsQueryDto
  ) {
    const userId = req.user?.userId;
    const query = new PaginationSearchPaymentsTerm(queryDTO, ['createdAt', 'expiresAt']);
    const { items, totalCount, pageNumber, pageSize } = await this.paymentsQueryRepository.getAllPayments(userId, query)
    return mapToViewModel({ items, totalCount, pageNumber, pageSize })
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
