import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Message } from '../../../../../prisma/generated/messenger-client';


@Injectable()
export class MessagesPrismaRepository {
  constructor(
    private prisma: PrismaService
  ) {
  }

  async createMessage(chatId: string, senderId: string, message: string): Promise<Message> {
    return this.prisma.message.create({
      data: {
        chatId,   // ID чата
        userId: senderId,      // ID автора
        content: {
          text: message
        },
      },
    });
  }

  async createMessageFile(chatId: string, senderId: string, file: Express.Multer.File & { location: string, originalName: string }): Promise<Message> {
    return this.prisma.message.create({
      data: {
        chatId,   // ID чата
        userId: senderId,      // ID автора
        content: {
          file: {
            fileName: file.originalName,
            fileUrl: file.location,
            mimeType: file.mimetype,
            size: file.size,
          },
        },
      },
    });
  }

  async createMessageRaw(userId: string, content: string): Promise<Message> {
    return this.prisma.$queryRaw<Message>`
      INSERT INTO messages (user_id, content) VALUES (${userId}, ${content})
    `;
  }

}