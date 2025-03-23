import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(@Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy) { }
  @Get()
  healthCheck() {
    return { status: 'ok' };  // Возвращаем статус микросервиса
  }
  // @Get('send')
  // sendMessage() {
  //   const message = { text: 'Hello, RabbitMQ!', timestamp: new Date() };
  //   this.client.emit('test_event', message); // Отправляем сообщение в очередь
  //   // return { message: 'Message sent to RabbitMQ', payload: message };
  // }

  @EventPattern('test_event')
  handleTestEvent(data: any) {
    console.log('📩 Received event:', data);
  }
}