import { PagedResponse } from '../../../../../common/pagination/paged.response';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentsViewModel } from './payment.model';

export class PagedResponseOfPayments extends PagedResponse<PaymentsViewModel> {
  @ApiProperty({ type: PaymentsViewModel, isArray: true })
  items: PaymentsViewModel[];
}

export function mapToViewModel({ items, totalCount, pageNumber, pageSize }): PagedResponseOfPayments {

  const mapped = items?.map(payment => {
    return {
      id: payment.id,
      userId: payment.authorId,
      subscriptionId: payment.subscriptionId,
      createdAt: new Date(payment?.createdAt),
      expiresAt: new Date(payment?.expiresAt) || null,
      deletedAt: new Date(payment?.deletedAt) || null,
      payType: payment.payType,
      subType: payment.subType,
      status: payment.status,
      amount: payment.amount,
    }
  }) || []
  return new PagedResponse<PaymentsViewModel>(mapped, totalCount, pageNumber, pageSize)
}