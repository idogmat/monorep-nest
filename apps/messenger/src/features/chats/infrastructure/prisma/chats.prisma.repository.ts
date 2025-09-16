import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Chat } from '../../../../../prisma/generated/messenger-client';


@Injectable()
export class ChatsPrismaRepository {
  constructor(
    private prisma: PrismaService
  ) {
  }
  async createChat(userId: string, content: string): Promise<Chat> {
    return this.prisma.$queryRaw<Chat>`
      INSERT INTO chats (user_id, content) VALUES (${userId}, ${content})
    `
  }

  async getByParticipants(senderId: string, userId: string): Promise<Chat> {
    return await this.prisma.chat.findFirst({
      where: {
        type: 'PRIVATE',
        AND: [
          { participants: { some: { userId: senderId } } },
          { participants: { some: { userId: userId } } },
        ],
      },
      include: { participants: true },
    });
  }
}