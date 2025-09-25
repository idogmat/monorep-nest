import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Chat } from '../../../../../prisma/generated/messenger-client';
import { ChatWithIncludes } from '../../model/chat.output.model';


@Injectable()
export class ChatsPrismaRepository {
  constructor(
    private prisma: PrismaService
  ) {
  }

  async createChat(senderId: string, userId: string): Promise<ChatWithIncludes> {
    return await this.prisma.chat.create({
      data: {
        type: "PRIVATE",
        participants: {
          create: [
            {
              userId: senderId, // инициатор
              role: "ADMIN",
            },
            {
              userId: userId, // второй участник
              role: "MEMBER",
            },
          ],
        },
      },
      include: {
        participants: true,
        messages: true
      },
    });
  }

  // async createChatRaw(userId: string, content: string): Promise<Chat> {
  //   return this.prisma.$queryRaw<Chat>`
  //     INSERT INTO chats (user_id, content) VALUES (${userId}, ${content})
  //   `
  // }


  async getByParticipants(senderId: string, userId: string): Promise<ChatWithIncludes> {
    return await this.prisma.chat.findFirst({
      where: {
        type: 'PRIVATE',
        AND: [
          { participants: { some: { userId: senderId } } },
          { participants: { some: { userId: userId } } },
        ],
      },
      include: {
        participants: true,
        messages: {
          orderBy: {
            createdAt: "desc", // новые в начале
          },
          take: 20, // например, только последние 20
        },
      },
    });
  }
}