import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatsPrismaRepository } from '../../infrastructure/prisma/chats.prisma.repository';

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

  async execute(command: GetChatByParticipantsCommand): Promise<any> {

    const newChat = await this.chatsPrismaRepository.getByParticipants(command.senderId,
      command.userId);

    return newChat;
  }
}