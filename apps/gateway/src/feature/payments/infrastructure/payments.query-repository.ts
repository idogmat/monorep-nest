import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationSearchPaymentsTerm } from '../api/model/input/payments.query.model';
import { Prisma } from '../../../../prisma/generated/client';

@Injectable()
export class PaymentsQueryRepository {
  constructor(private prisma: PrismaService) {
  }
  async getAllPayments(userId: string, queryDto?: PaginationSearchPaymentsTerm) {

    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;

    const where: Prisma.PaymentWhereInput = { userId };

    const allowedSortFields: (keyof Prisma.PaymentOrderByWithRelationInput)[] = [
      'createdAt',
    ];

    const orderBy: Prisma.PaymentOrderByWithRelationInput = allowedSortFields.includes(sortBy as any)
      ? { [sortBy]: sortDirection.toLowerCase() as 'asc' | 'desc' }
      : { createdAt: 'desc' };

    const [items, totalCount] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        orderBy,
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { items, totalCount, pageNumber, pageSize };

  }


}