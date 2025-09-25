import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatsPrismaRepository } from '../../infrastructure/prisma/chats.prisma.repository';
import { RabbitService } from '../rabbit.service';
import { Inject } from '@nestjs/common';

export class SendChatNotifyCommand {
  constructor(
    public chat: string,
  ) {
  }
}
@CommandHandler(SendChatNotifyCommand)
export class SendChatNotifyUseCases implements ICommandHandler<SendChatNotifyCommand> {
  constructor(
    private postsPrismaRepository: ChatsPrismaRepository,
    @Inject('RABBIT_SERVICE') private readonly rabbitClient: RabbitService

  ) {
  }

  async execute(command: SendChatNotifyCommand): Promise<any> {
    console.log(command.chat, 'SendChatNotifyCommand')
    const rabbit = await this.rabbitClient.publishToQueue('messenger_queue', {
      type: 'UPLOAD_CHAT_FILE',
      data: command.chat,
      createdAt: new Date(),
    });
    // const chat = await this.postsPrismaRepository.createChat(command.userId,
    //   command.content);
    // console.log(chat)
    // return chat;
  }
}