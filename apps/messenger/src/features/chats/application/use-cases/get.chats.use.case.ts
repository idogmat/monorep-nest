import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatWithIncludes } from '../../model/chat.output.model';
import { ChatsQueryRepository } from '../../infrastructure/prisma/chats-query-repository.service';

export class GetChatsCommand {
  constructor(
    public senderId: string,
  ) {
  }
}
@CommandHandler(GetChatsCommand)
export class GetChatsUseCases implements ICommandHandler<GetChatsCommand> {
  constructor(
    private chatsQueryRepository: ChatsQueryRepository
  ) {
  }

  async execute(command: GetChatsCommand): Promise<ChatWithIncludes[]> {

    const chats = await this.chatsQueryRepository.getChatsBySenderIdRaw(command.senderId);
    return chats;
  }
}