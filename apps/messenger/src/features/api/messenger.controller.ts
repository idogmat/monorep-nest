import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GrpcMethod } from '@nestjs/microservices';
import { GetChatByParticipantsCommand } from '../chats/application/use-cases/get.chat.by.participants.use.case';

@Controller()
export class MessengerController {
  constructor(
    private commandBus: CommandBus,

  ) {
  }

  @GrpcMethod('MessengerService', 'CreateMessage')
  async createPost(
    data: any
  ) {
    console.log(data, 'data')
    try {
      const res = await this.commandBus.execute(new GetChatByParticipantsCommand(data.userId, data.senderId))
      console.log(res, 'dfffffff')
      return data
    } catch (error) {

    }
  }
}
