import { Inject, Injectable } from '@nestjs/common';
import { S3StorageAdapter, UploadedFileResponse } from './s3.service';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('PROFILE_BUCKET_ADAPTER') private s3Adapter: S3StorageAdapter,
  ) {
  }
  async uploadImage(file: any, folder: string): Promise<UploadedFileResponse> {
    const files = await this.s3Adapter.getFilesByPath(folder)
    const result: UploadedFileResponse = await this.s3Adapter.uploadFile(file, folder)
    files.forEach(async (f) => await this.s3Adapter.deleteFile(f.Key))
    return result
  }

  async getFileUrl(key: string): Promise<string> {
    return await this.s3Adapter.getFileUrl(key);
  }

}