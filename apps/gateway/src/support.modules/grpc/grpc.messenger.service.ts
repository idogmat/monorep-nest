import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';
import { SendMessageRequest, Chat, GetChatsRequest, GetChatsResponse } from '../../../../libs/proto/generated/messenger';


interface MessengerService {
  GetChats(data: GetChatsRequest): Observable<GetChatsResponse>;
  CreateMessage(data: SendMessageRequest): Observable<Chat>;
}

@Injectable()
export class MessengerClientService implements OnModuleInit {
  private messengerService: MessengerService

  constructor(
    @Inject('MESSENGER_SERVICE') private readonly client: ClientGrpc
  ) { }
  onModuleInit() {
    this.messengerService = this.client.getService<MessengerService>('MessengerService');
  }

  async createMessage(data: SendMessageRequest) {
    return lastValueFrom(this.messengerService.CreateMessage(data));
  }

  async getChats(data: GetChatsRequest) {
    return lastValueFrom(this.messengerService.GetChats(data));
  }


}