import { Prisma } from "../../../../prisma/generated/messenger-client";

export type ChatWithIncludes = Prisma.ChatGetPayload<{
  include: { participants: true, messages: true }
}>;