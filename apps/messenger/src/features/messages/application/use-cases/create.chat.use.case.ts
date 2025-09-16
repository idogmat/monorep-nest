import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MessagesPrismaRepository } from '../../infrastructure/prisma/messages.prisma.repository';

export class CreateMessageCommand {
  constructor(
    public content: string,
    public userId: string,
  ) {
  }
}
@CommandHandler(CreateMessageCommand)
export class CreateMessageUseCases implements ICommandHandler<CreateMessageCommand> {
  constructor(
    private messagesPrismaRepository: MessagesPrismaRepository
  ) {
  }

  async execute(command: CreateMessageCommand): Promise<string> {

    const newMessage = await this.messagesPrismaRepository.createMessage(command.userId,
      command.content);

    return newMessage.id;
  }
}