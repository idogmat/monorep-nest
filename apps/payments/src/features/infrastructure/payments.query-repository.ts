import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetSubscribesQuery } from '../../../../libs/proto/generated/payments';
import { Prisma } from '../../../prisma/generated/payments-client';


@Injectable()
export class PaymentsQueryRepository {
  constructor(private prisma: PrismaService) {
  }
  async getAllPayments(query: GetSubscribesQuery) {

    const { pageNumber, pageSize, sortBy, sortDirection, userId } = query;

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