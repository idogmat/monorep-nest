import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatsPrismaRepository } from '../../infrastructure/prisma/chats.prisma.repository';

export class CreateChatCommand {
  constructor(
    public content: string,
    public userId: string,
  ) {
  }
}
@CommandHandler(CreateChatCommand)
export class CreateChatUseCases implements ICommandHandler<CreateChatCommand> {
  constructor(
    private postsPrismaRepository: ChatsPrismaRepository
  ) {
  }

  async execute(command: CreateChatCommand): Promise<any> {

    const chat = await this.postsPrismaRepository.createChat(command.userId,
      command.content);
    console.log(chat)
    return chat;
  }
}