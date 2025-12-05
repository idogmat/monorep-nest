import { Inject, Injectable } from '@nestjs/common';
import { S3StorageAdapter, UploadedFileResponse } from './s3.service';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3UploadPhotoService {
  constructor(
    @Inject('POST_PHOTO_BUCKET_ADAPTER') private s3Adapter: S3StorageAdapter,
  ) {
  }

  async uploadImage(file: any, folder: string): Promise<UploadedFileResponse> {
    return await this.s3Adapter.uploadFile(file, folder)
  }

  async getFileUrl(key: string): Promise<string> {
    return await this.s3Adapter.getFileUrl(key);
  }
}