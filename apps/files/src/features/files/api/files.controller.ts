// src/files.controller.ts

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FilesService } from '../application/files.service';
import { InterlayerNotice } from '../../../../../gateway/src/common/error-handling/interlayer.notice';
import { UploadSummaryResponse } from '../../../common/types/upload.summary.response';

@Controller()
export class FilesController {
  constructor(
              private readonly filesService: FilesService) {
  }

  @MessagePattern('upload_files')
  async handleFilesUpload( @Payload() data: { files: Express.Multer.File[], postId: string, userId: string }) : Promise<UploadSummaryResponse>{
    console.log("Hi");
    const { files, postId, userId } = data;
    return this.filesService.sendPhoto(userId, postId, files);
  }
}
