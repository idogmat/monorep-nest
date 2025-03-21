import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
declare const Buffer;
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

  async savePhoto(userId: string, postId:string, originalName: string, buffer: any){

    const realBuffer = Buffer.from(buffer.data);

    const key = `uploads/user_${userId}/post_${postId}/${Date.now()}_${postId}.png`;
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: realBuffer,
      // Body: buffer,
      ContentType: 'image/png',

    };

    const command = new PutObjectCommand(params);
    try {
      const uploadResult = await this.s3Client.send(command);
      console.log("uploadResult", uploadResult);
      console.log(`https://storage.yandexcloud.net/${this.bucketName}/${key}`);
      return{
        url: `https://storage.yandexcloud.net/${this.bucketName}/${key}`,
        field: 'relativePath'
      }
    }catch (exception){
      console.error("Ошибка при загрузке файла в S3:", exception)
      throw exception;
    }

  }
}