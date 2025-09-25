import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatsPrismaRepository } from '../../infrastructure/prisma/chats.prisma.repository';
import { ChatWithIncludes } from '../../model/chat.output.model';

export class GetChatByParticipantsCommand {
  constructor(
    public senderId: string,
    public userId: string,
  ) {
  }
}
@CommandHandler(GetChatByParticipantsCommand)
export class GetChatByParticipantsUseCases implements ICommandHandler<GetChatByParticipantsCommand> {
  constructor(
    private chatsPrismaRepository: ChatsPrismaRepository
  ) {
  }

  async execute(command: GetChatByParticipantsCommand): Promise<ChatWithIncludes> {

    let chat = await this.chatsPrismaRepository.getByParticipants(command.senderId,
      command.userId);

    if (!chat) {
      chat = await this.chatsPrismaRepository.createChat(command.senderId,
        command.userId);
    }

    return chat;
  }
}