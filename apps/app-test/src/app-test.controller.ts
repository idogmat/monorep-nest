import { Controller, Get } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppTestController {
  constructor() { }

  @MessagePattern('get_data')
  getData(@Payload() data: any) {
    console.log('Service B received:', data);
    return { message: 'Hello from Service B!', received: data };
  }
}