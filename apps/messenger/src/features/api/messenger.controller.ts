import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GrpcMethod } from '@nestjs/microservices';
import { GetChatByParticipantsCommand } from '../chats/application/use-cases/get.chat.by.participants.use.case';
import { CreateMessageCommand } from '../messages/application/use-cases/create.message.use.case';
import { GetChatsCommand } from '../chats/application/use-cases/get.chats.use.case';

@Controller()
export class MessengerController {
  constructor(
    private commandBus: CommandBus,

  ) {
  }
  @GrpcMethod('MessengerService', 'GetChats')
  async getChats(
    data: {
      senderId: string,
    }
  ) {
    console.log(data, 'data')
    try {
      const chats = await this.commandBus.execute(new GetChatsCommand(data.senderId))
      console.log(chats)

      return { chats }
    } catch (error) {

    }
  }

  @GrpcMethod('MessengerService', 'CreateMessage')
  async createMessage(
    data: {
      senderId: string,
      userId: string,
      message: string
    }
  ) {
    console.log(data, 'data')
    try {
      const chat = await this.commandBus.execute(new GetChatByParticipantsCommand(data.senderId, data.userId))
      const message = await this.commandBus.execute(new CreateMessageCommand(chat.id, data.senderId, data.message))
      chat.messages.unshift(message)
      console.log(chat)

      return chat
    } catch (error) {

    }
  }
}
