import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as AWS from 'aws-sdk';


@Injectable()
export class S3StorageAdapterJ {
  private s3: AWS.S3;
  constructor(
    private configService: ConfigService,
    private bucketName: string,
  ) {
    const s3Config = {
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      s3ForcePathStyle: true,
    };
    this.bucketName = bucketName || this.configService.get<string>('AWS_BUCKET_NAME');
    this.s3 = new AWS.S3(s3Config);
  }

  async uploadFile(file: any, folder: string): Promise<AWS.S3.ManagedUpload.SendData> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: `${folder}/${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    return this.s3.upload(params).promise();
  }

  async getFileUrl(key: string): Promise<string> {
    return await this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucketName,
      Key: key,
      Expires: false
    });
  }

  async clearBucket(): Promise<void> {
    const data: AWS.S3.ObjectList = await new Promise((resolve, reject) => {
      this.s3.listObjectsV2({ Bucket: this.bucketName }, (err, data) => {
        if (data?.Contents) {
          resolve(data.Contents)
        } else {
          console.log(err, err.stack);
          reject()
        }
      });
    })
    if (data) {
      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects: data.map(item => ({ Key: item.Key })),
        },
      };
      await this.s3.deleteObjects(deleteParams, (err, data) => {
        if (data) {
          console.log('fin')
        } else {
          console.log(err, err.stack);
        }
      });
    }
  }

}