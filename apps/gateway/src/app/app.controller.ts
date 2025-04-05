import { Controller, Get, Inject, Param, Req, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('TCP_SERVICE') private readonly client: ClientProxy,

  ) { }

  @Get()
  getHello() {
    console.log('Hello World route is being called');
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

  @Get('redirect')
  async loh(
    @Req() req: Request,
    @Res() res: Response
  ) {
    res.cookie('front', 'ya vertel')
    res.redirect('http://localhost:5173?tvoyToken=13412312')


  }


}
