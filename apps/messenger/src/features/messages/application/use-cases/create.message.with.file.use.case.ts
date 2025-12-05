import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MessagesPrismaRepository } from '../../infrastructure/prisma/messages.prisma.repository';

export class CreateMessageWithFileCommand {
  constructor(
    public chatId: string,
    public senderId: string,
    public file: Express.Multer.File & { location: string, originalName: string },
  ) {
  }
}
@CommandHandler(CreateMessageWithFileCommand)
export class CreateMessageWithFileUseCases implements ICommandHandler<CreateMessageWithFileCommand> {
  constructor(
    private messagesPrismaRepository: MessagesPrismaRepository
  ) {
  }

  async execute(command: CreateMessageWithFileCommand): Promise<any> {

    const newMessage = await this.messagesPrismaRepository.createMessageFile(
      command.chatId,
      command.senderId,
      command.file
    );

    return newMessage;
  }
}