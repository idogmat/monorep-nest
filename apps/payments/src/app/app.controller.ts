import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Controller()
export class AppController {
  constructor(@Inject('TCP_SERVICE') private readonly client: ClientProxy) { }
  
  @Get()
  getHello() {
    return 'Hello World!'
  }

  @Get('get-data')
  async getData() {
    console.log('Sending request to Service B via TCP...');
    try {
      const response = await firstValueFrom(
        this.client.send('get_data', { text: 'Hello, Service B!' })
      );
      console.log('Response from Service B:', response);
      return response;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  @Get('emit-data')
  async requestEmit() {
    console.log('Emitting event to Service B via TCP...');
    this.client.emit('emit_data', { text: 'Hello, Service B!' });
    return 'Data emitted to Service B!';
  }
}
