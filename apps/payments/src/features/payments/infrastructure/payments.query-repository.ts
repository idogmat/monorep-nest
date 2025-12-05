import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetSubscribesGqlQuery, GetSubscribesQuery } from '../../../../../libs/proto/generated/payments';
import { Payment, Prisma } from '../../../../prisma/generated/payments-client';


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

  async getAllPaymentsGql(query: GetSubscribesGqlQuery): Promise<{ items: Payment[] } & { totalCount: number }> {
    const settings = {
      skip: query.offset ?? 0,
      take: query.limit ?? undefined,
      orderBy: {
        [query.sortBy]: query.sortDirection.toLocaleLowerCase()
      },
    }
    if (query.userId) Object.assign(settings, {
      where: {
        userId: query.userId
      }
    })
    const querySettings = this.prisma.payment.findMany(settings);

    const [items, totalCount] = await Promise.all([
      querySettings,
      this.prisma.payment.count(settings)
    ]);

    return { items, totalCount };
  }

}