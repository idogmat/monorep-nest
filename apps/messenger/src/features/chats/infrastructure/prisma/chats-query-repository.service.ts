import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChatWithIncludes } from '../../model/chat.output.model';


@Injectable()
export class ChatsQueryRepository {
  constructor(private prisma: PrismaService) {
  }

  async getChatsBySenderId(senderId: string): Promise<ChatWithIncludes[]> {
    return await this.prisma.chat.findMany({
      where: {
        type: 'PRIVATE',
        participants: { some: { userId: senderId } },
      },
      include: {
        participants: true,
        messages: {
          orderBy: {
            createdAt: "desc", // новые в начале
          },
          take: 10, // например, только последние 20
        },
      },
    });
  }

  async getChatsBySenderIdRaw(senderId: string): Promise<ChatWithIncludes[]> {
    return this.prisma.$queryRaw<ChatWithIncludes[]>`
    SELECT 
      c."id",
      c."createdAt",
      c."updatedAt",
      c."deletedAt",
      c."type"::text as "type",
      c."name",

      -- Собираем участников
      (
        SELECT json_agg(
          json_build_object(
            'id', cp."id",
            'chatId', cp."chatId",
            'userId', cp."userId",
            'role', cp."role",
            'joinedAt', cp."joinedAt"
          ) ORDER BY cp."joinedAt"
        )
        FROM "public"."chat_participants" cp
        WHERE cp."chatId" = c."id"
      ) as participants,

      -- Собираем сообщения
      (
        SELECT json_agg(
          json_build_object(
            'id', m."id",
            'createdAt', m."createdAt",
            'updatedAt', m."updatedAt",
            'deletedAt', m."deletedAt",
            'userId', m."userId",
            'chatId', m."chatId",
            'content', m."content",
            'status', m."status",
            'editedAt', m."editedAt"
          ) ORDER BY m."createdAt" DESC
        )
        FROM "public"."messages" m
        WHERE m."chatId" = c."id"
      ) as messages

    FROM "public"."chats" c
    WHERE EXISTS (
      SELECT 1
      FROM "public"."chat_participants" cp
      WHERE cp."userId" = ${senderId}
        AND cp."chatId" = c."id"
    )
    ORDER BY c."createdAt" DESC;
  `;
  }

}