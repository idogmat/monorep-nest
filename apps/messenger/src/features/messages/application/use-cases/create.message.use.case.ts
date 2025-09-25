import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MessagesPrismaRepository } from '../../infrastructure/prisma/messages.prisma.repository';

export class CreateMessageCommand {
  constructor(
    public chatId: string,
    public senderId: string,
    public message: string,
  ) {
  }
}
@CommandHandler(CreateMessageCommand)
export class CreateMessageUseCases implements ICommandHandler<CreateMessageCommand> {
  constructor(
    private messagesPrismaRepository: MessagesPrismaRepository
  ) {
  }

  async execute(command: CreateMessageCommand): Promise<any> {

    const newMessage = await this.messagesPrismaRepository.createMessage(
      command.chatId,
      command.senderId,
      command.message
    );

    return newMessage;
  }
}