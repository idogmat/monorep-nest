import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
declare const Buffer;
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { UploadPhotoResponse } from '../types/upload.photo.response';
@Injectable()
export class S3StorageAdapter{
  s3Client: S3Client;
  bucketName: string;
  constructor(private configService: ConfigService) {

    this.s3Client = new S3Client({
      region: "ru-central1-a",
      endpoint: 'https://storage.yandexcloud.net',
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY'),
      },
    } as any);

    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME')

  }

  async savePhoto(userId: string, postId:string, file: Express.Multer.File): Promise<UploadPhotoResponse>{

    const extension = file.mimetype.split('/')[1];

    const realBuffer = Buffer.from(file.buffer);
    const fileExtension = this.getFullExtension(file.originalname);
    const originalName = `${randomUUID()}.${fileExtension}`;
    const compressedName = `${randomUUID()}_compressed.${fileExtension}`;

    const originalKey = `uploads/user_${userId}/post_${postId}/${originalName}`;
    const compressedKey = `uploads/user_${userId}/post_${postId}/${compressedName}`;

    //send original photo
    const originalParams = {
      Bucket: this.bucketName,
      Key: originalKey,
      Body: realBuffer,
      ContentType: file.mimetype,

    };

    //create compressed version
    const compressedBuffer =  await sharp(realBuffer)
      .resize({width: 800})
      .toFormat(extension === 'png' ? 'png' : 'jpeg', { quality: 80 })
      .toBuffer();

    //send compressed photo
    const compressedParams = {
      Bucket: this.bucketName,
      Key: compressedKey,
      Body: compressedBuffer,
      ContentType: file.mimetype,

    };

    try{

      const [originalUpload, compressedUpload] = await Promise.all([
          this.s3Client.send(new PutObjectCommand(originalParams)),
        this.s3Client.send(new PutObjectCommand(compressedParams)),
        ]);
        return{
          // originalUrl: `https://storage.yandexcloud.net/${this.bucketName}/${originalKey}`,
          // compressedUrl: `https://storage.yandexcloud.net/${this.bucketName}/${compressedKey}`,
          originalKey: originalKey,
          compressedKey: compressedKey,
          originalFileId: originalUpload.ETag,
          compressedFileId: compressedUpload.ETag,
        }
    }catch (exception){
      console.error("Ошибка при загрузке файла в S3:", exception)
      throw exception;
    }

  }
  getFullExtension(filename: string): string | null {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.slice(-2).join('.') : null;
  }
}