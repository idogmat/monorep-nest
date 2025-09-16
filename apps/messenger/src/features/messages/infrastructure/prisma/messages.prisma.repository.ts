import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Message } from '../../../../../prisma/generated/messenger-client';


@Injectable()
export class MessagesPrismaRepository {
  constructor(
    private prisma: PrismaService
  ) {
  }
  async createMessage(userId: string, content: string): Promise<Message> {
    return this.prisma.$queryRaw<Message>`
      INSERT INTO messages (user_id, content) VALUES (${userId}, ${content})
    `;
  }

}