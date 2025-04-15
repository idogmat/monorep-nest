import { Body, Controller, Get, HttpCode, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../../../../src/common/guard/authGuard';
import { SubscribeDto, SubscribeProductDto } from './model/input/input.subscribe';
import { PaginationPaymentsQueryDto } from './model/input/pagination.query';
import { PaginationSearchPaymentsTerm } from './model/input/payments.query.model';
import { mapToViewModel, PagedResponseOfPayments } from './model/output/paged.payments.model';
import { ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PaymentUrlModel } from './model/output/url.model';
import { PaymentsClientService } from '../../../support.modules/grpc/grpc.payments.service';
import { UsersService } from '../../user-accounts/users/application/users.service';
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsClientService: PaymentsClientService,
    private readonly usersService: UsersService,
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
    const { id, email, name } = await this.usersService.findById(userId)
    return await this.paymentsClientService.createSubscribe({ id, email, name }, product)

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
    await this.paymentsClientService.unSubscribe({ paymentId, userId })

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
    console.log(queryDTO)
    console.log(query)
    const { items, totalCount, pageNumber, pageSize } = await this.paymentsClientService.getProfiles({ ...query, userId })
    console.log(items)
    return mapToViewModel({ items, totalCount, pageNumber, pageSize })
  }
}
