// src/files.controller.ts

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { S3StorageAdapter } from '../common/s3/s3.storage.adapter';

@Controller()
export class FilesController {
  constructor(
              private readonly s3StorageAdapter: S3StorageAdapter) {
    console.log('S3StorageAdapter загружен!');
  }

  @MessagePattern('upload_files')
  async handleFilesUpload(@Payload() data: { files: { fileBuffer: Buffer, fileName: string }[] }) {
    const { files } = data;
    const uploadedFilesUrls = [];

    console.log("files received", files);
    for (const file of files) {
      try {
        const fileUrl = await this.s3StorageAdapter.savePhoto('11111', 'post1', file.fileName, file.fileBuffer);
        uploadedFilesUrls.push({ fileName: file.fileName, fileUrl });
      } catch (error) {
        uploadedFilesUrls.push({ fileName: file.fileName, error: error.message });
      }
    }

    return { message: 'Files uploaded successfully', files: uploadedFilesUrls };
  }
}
