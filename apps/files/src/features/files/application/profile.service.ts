import { Inject, Injectable } from '@nestjs/common';
import { S3StorageAdapterJ } from './s3.service';
import * as AWS from 'aws-sdk';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('PROFILE_BUCKET_ADAPTER') private s3Adapter: S3StorageAdapterJ,
  ) {
  }
  async uploadImage(file: any, folder: string): Promise<AWS.S3.ManagedUpload.SendData> {
    const files = await this.s3Adapter.getFilesByPath(folder)
    const result: AWS.S3.ManagedUpload.SendData = await this.s3Adapter.uploadFile(file, folder)
    files.forEach(async (f) => await this.s3Adapter.deleteFile(f.Key))
    return result
  }

  async getFileUrl(key: string): Promise<string> {
    return await this.s3Adapter.getFileUrl(key);
  }
}