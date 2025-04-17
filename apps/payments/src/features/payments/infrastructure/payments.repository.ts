import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Payment, PaymentStatus } from '../../../../prisma/generated/payments-client';


@Injectable()
export class PaymentsRepository {
  constructor(private prisma: PrismaService) {
  }

  async createPayment(data: { createdAt: string, customerId: string, userId: string }): Promise<Payment> {
    return this.prisma.payment.create({
      data: {
        ...data
      }
    })
  }

  async findPaymentById(id: string): Promise<Payment> {
    return this.prisma.payment.findFirst({
      where: {
        id
      }
    })
  }

  async updatePayment(
    data: {
      subscriptionId: string,
      createdAt: string,
      expiresAt: string,
      customerId: string,
      subType: string,
      amount: number,
    }
  ): Promise<Payment | null> {
    const {
      subscriptionId,
      createdAt,
      expiresAt,
      customerId,
      subType,
      amount,
    } = data;
    return await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: {
          customerId,
          deletedAt: null
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      })
      if (!payment) throw new ForbiddenException()
      return await tx.payment.update({
        where: { id: payment.id },
        data: {
          subscriptionId,
          createdAt,
          expiresAt,
          subType,
          amount
        }
      })
    })
  }

  async updatePaymentProduct(
    data: {
      subscriptionId: string,
      subType: string,
      amount: number,
    }
  ): Promise<Payment | null> {
    const {
      subscriptionId,
      subType,
      amount,
    } = data;
    return await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: {
          subscriptionId,
          deletedAt: null
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      })
      // console.log(payment, 'payment')
      if (!payment) throw new ForbiddenException()
      return await tx.payment.update({
        where: { id: payment.id },
        data: {
          subType,
          amount
        }
      })
    })
  }

  async updatePaymentStatus(
    data: {
      subscriptionId: string,
      status: PaymentStatus,
      userId: string,
    }
  ): Promise<Payment | null> {
    const {
      subscriptionId,
      status,
      userId,
    } = data;
    return await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: {
          subscriptionId,
          userId,
          deletedAt: null
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      })
      if (!payment) throw new ForbiddenException()
      return await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: status
        }
      })
    })
  }

  async markPaymentAsDeleted(
    data: {
      subscriptionId: string,
      customerId: string,
      expiresAt: string,
      deletedAt: string,
    }
  ): Promise<Payment | null> {
    const {
      subscriptionId,
      customerId,
      deletedAt,
      expiresAt
    } = data;
    return await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { subscriptionId, customerId },
        orderBy: { createdAt: 'desc' },
        take: 1,
      })
      if (!payment) throw new ForbiddenException()
      return await tx.payment.update({
        where: { id: payment.id },
        data: {
          deletedAt,
          expiresAt,
          status: PaymentStatus.CANCEL
        }
      })
    })
  }

  async updatePaymentExpire(
    data: {
      subscriptionId: string,
      expiresAt: string,
    }
  ): Promise<Payment | null> {
    const {
      subscriptionId,
      expiresAt
    } = data;
    return await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { subscriptionId },
        orderBy: { createdAt: 'desc' },
        take: 1,
      })
      if (!payment) throw new ForbiddenException()
      return await tx.payment.update({
        where: { id: payment.id },
        data: {
          expiresAt
        }
      })
    })
  }

  async findByUserId(userId: string): Promise<Payment[] | []> {
    return this.prisma.payment.findMany({
      where: {
        userId,
        deletedAt: null
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async checkExpiers(): Promise<
    {
      expired: Payment[] | [],
      active: Payment[] | []
    }
  > {
    const expired = await this.prisma.payment.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        status: PaymentStatus.ACTIVE
      },
      // orderBy: { createdAt: 'desc' }
    });
    const userIds = [...new Set(expired.map(p => p.userId))];
    if (userIds.length === 0) {
      // нет истёкших
      return { expired: [], active: [] };
    }

    // Шаг 3: получаем все платежи этих пользователей
    const active = await this.prisma.payment.findMany({
      where: {
        userId: {
          in: userIds,
        },
        expiresAt: {
          gt: new Date(),
        },
        status: PaymentStatus.ACTIVE,
      },
    })
    return { expired, active }
  }

  async toggleStatus(id: string): Promise<void> {
    await this.prisma.payment.update({
      where: {
        id
      },
      data: {
        status: PaymentStatus.CANCEL
      }
    })
  }

}