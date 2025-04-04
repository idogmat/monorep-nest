import { Global, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface MessageService {
  GetMessage(data: { id: string }): Observable<any>;
}

@Injectable()
export class MessageClientService implements OnModuleInit {
  private messageService: MessageService;

  constructor(
    @Inject('MESSAGE_SERVICE') private client: ClientGrpc, // Имя должно совпадать
  ) { }

  onModuleInit() {
    this.messageService = this.client.getService<MessageService>('MessageService');
  }

  async getMessage(id: string) {
    return this.messageService.GetMessage({ id }).toPromise();
  }
}