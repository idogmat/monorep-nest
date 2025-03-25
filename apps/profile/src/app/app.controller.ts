import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { ProfileService } from '../features/profile.service';

@Controller()
export class AppController {
  constructor(readonly profileService: ProfileService) { }

  @Get()
  healthCheck() {
    return this.profileService.findMany({});  // Возвращаем статус микросервиса
  }
  // @Get('send')
  // sendMessage() {
  //   const message = { text: 'Hello, RabbitMQ!', timestamp: new Date() };
  //   this.client.emit('test_event', message); // Отправляем сообщение в очередь
  //   // return { message: 'Message sent to RabbitMQ', payload: message };
  // }

  // @EventPattern('test_event')
  // handleTestEvent(data: any) {
  //   console.log('📩 Received event: PROFILE', data);
  // }

  @EventPattern('load_profile_photo')
  handleTestEvent(data: any) {
    console.log('📩 Received event: PROFILE', data);
    this.profileService.createDevice(data)

  }
}