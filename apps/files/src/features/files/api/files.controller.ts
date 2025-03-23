// src/files.controller.ts

import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { FilesService } from '../application/files.service';
import { UploadSummaryResponse } from '../../../common/types/upload.summary.response';

@Controller()
export class FilesController {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    private readonly filesService: FilesService
  ) {
  }

  @Get('send')
  sendMessage() {
    const message = { text: 'Hello, RabbitMQ!', timestamp: new Date() };
    this.client.emit('test_event', message); // Отправляем сообщение в очередь
    // return { message: 'Message sent to RabbitMQ', payload: message };
  }

  // @EventPattern('test_event')
  // handleTestEvent(data: any) {
  //   console.log('📩 Received event:', data);
  // }

  @MessagePattern('upload_files')
  async handleFilesUpload(@Payload() data: { files: Express.Multer.File[], postId: string, userId: string }): Promise<UploadSummaryResponse> {
    console.log("Hi");
    const { files, postId, userId } = data;
    return this.filesService.sendPhoto(userId, postId, files);
  }
}
