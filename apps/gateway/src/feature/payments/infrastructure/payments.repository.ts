import { ForbiddenException, Injectable } from '@nestjs/common';
import { Payment, Post } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

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
      customerId: string,
      subType: string,
      amount: number,
    }
  ): Promise<Payment | null> {
    const {
      subscriptionId,
      createdAt,
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
          subType,
          amount
        }
      })
    })
  }

  async updatePaymentExpire(
    data: {
      subscriptionId: string,
      expiresAt: string,
      userId: string,
    }
  ): Promise<Payment | null> {
    const {
      subscriptionId,
      expiresAt,
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
          expiresAt
        }
      })
    })
  }

  async markPaymentAsDeleted(
    data: {
      subscriptionId: string,
      customerId: string,
      deletedAt: string,
    }
  ): Promise<Payment | null> {
    const {
      subscriptionId,
      customerId,
      deletedAt,
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
          deletedAt
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

  async updatePost(param: { id: string, data: Partial<Post> }) {
    return this.prisma.post.update({
      where: { id: param.id },
      data: param.data
    })
  }

  async delete(param: { id: string }) {
    await this.prisma.post.delete({
      where: { id: param.id }
    })
  }
}