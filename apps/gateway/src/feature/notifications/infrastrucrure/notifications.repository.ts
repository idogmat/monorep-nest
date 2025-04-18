import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Notification, NotifyStatus } from '../../../../prisma/generated/client';

@Injectable()
export class NotificationsRepository {
  constructor(private prisma: PrismaService) {
  }
  // expiresAt
  // usserId

  async createNotificationBySubscribe(userId: string, expiresAt: string): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId,
        expiresAt,
        type: NotifyStatus.subscribe
      }
    })
  }

  async getNotificationsSubscribe(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date()
        },
        type: NotifyStatus.subscribe
      },
      orderBy: { expiresAt: 'desc' }
    })
  }

  // async updateStatusForPost(postId: string, status: PhotoUploadStatus): Promise<Post> {
  //   return this.prisma.post.update({
  //     where: { id: postId },
  //     data: { photoUploadStatus: status }
  //   })
  // }

  // async findById(id: string): Promise<Post | null> {
  //   return this.prisma.post.findFirst({
  //     where: { id }
  //   })
  // }

  // async updatePost(param: { id: string, data: Partial<Post> }) {
  //   return this.prisma.post.update({
  //     where: { id: param.id },
  //     data: param.data
  //   })
  // }

  // async delete(param: { id: string }) {
  //   await this.prisma.post.delete({
  //     where: { id: param.id }
  //   })
  // }
}