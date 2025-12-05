import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { createReadStream } from 'fs';
import { ConfigService } from '@nestjs/config';
export class SendFileService {
  private client: any;

  constructor(private configService: ConfigService) {
    const protoPath = join(__dirname, 'files.proto');
    console.log(protoPath)
    const packageDef = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });
    const grpcObject = grpc.loadPackageDefinition(packageDef) as any;
    const FileService = grpcObject.files?.FileService;

    this.client = new FileService(
      this.configService.get('GATE_FILES_GRPC_URL'),
      grpc.credentials.createInsecure(),
    );
  }
  async uploadFilesGrpc(files: Express.Multer.File[], userId: string, postId: string): Promise<any[]> {
    console.log(files)
    return Promise.all(
      files.map(file =>
        new Promise((resolve, reject) => {
          const call = this.client.Upload((err: any, response: any) => {
            if (err) return reject(err);
            resolve(response);
          });

          const stream = createReadStream(file.path, { highWaterMark: 64 * 1024 });

          stream.on('data', (chunk) => {
            call.write({ chunkData: chunk, filename: file.originalname, userId, postId });
          });

          stream.on('end', () => {
            console.log('end')
            call.end();
          });

          stream.on('error', (err) => {
            console.log('error')
            call.destroy();
            reject(err);
          });
        })
      )
    );
  }

  async uploadFileGrpc(file: Express.Multer.File, userId: string): Promise<any> {
    const tempFilePath = file.path;
    await new Promise((resolve, reject) => {
      const call = this.client.UploadProfile((err: any, response: any) => {
        if (err) return reject(err);
        resolve(response);
      });
      console.log(tempFilePath, 'tempFilePath')
      const stream = createReadStream(tempFilePath, { highWaterMark: 64 * 1024 });

      stream.on('data', (chunk) => {
        console.log('data', chunk)
        call.write({ chunkData: chunk, filename: file.originalname, userId });
      });

      stream.on('end', () => {
        console.log('end')
        call.end();
      });

      stream.on('error', (err) => {
        console.log('error')
        call.destroy();
        reject(err);
      });
    })
  }

  async uploadFileForChatGrpc(file: Express.Multer.File, senderId: string, userId: string): Promise<any> {
    const tempFilePath = file.path;
    await new Promise((resolve, reject) => {
      const call = this.client.UploadChatFile((err: any, response: any) => {
        if (err) return reject(err);
        resolve(response);
      });
      console.log(tempFilePath, 'tempFilePath')
      const stream = createReadStream(tempFilePath, { highWaterMark: 64 * 1024 });

      stream.on('data', (chunk) => {
        console.log('data', chunk)
        call.write({ chunkData: chunk, filename: file.originalname, senderId, userId });
      });

      stream.on('end', () => {
        console.log('end')
        call.end();
      });

      stream.on('error', (err) => {
        console.log('error')
        call.destroy();
        reject(err);
      });
    })
  }

}





