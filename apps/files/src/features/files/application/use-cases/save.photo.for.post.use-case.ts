import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { FilesRepository } from '../../infrastructure/files.repository';
import { S3UploadPhotoService } from '../post.photo.service';
import { createWriteStream, existsSync, promises as fs, mkdirSync, WriteStream } from 'fs';
import * as AWS from 'aws-sdk';
import type { FailedUpload, } from '../../../../common/types/upload.result';
import { Inject } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { join } from 'path';
import { LoadFilesEvent } from '../event-bus/load.files.post.event';
import { LocalPathRepository } from '../../infrastructure/localPath.repository';

interface SuccessLoad {
  success: boolean;
  message: string;
  userId: string;
  postId: string;
}
interface FiledLoad {
  success: boolean;
  message: string;
  userId: string;
  postId: string;
}
export class SavePhotoForPostCommand {
  constructor(
    public stream: Observable<{ chunkData: Buffer; filename: string; userId: string, postId: string }>,
  ) {
  }
}

@CommandHandler(SavePhotoForPostCommand)
export class SavePhotoForPostUseCase implements ICommandHandler<SavePhotoForPostCommand> {

  constructor(
    private readonly localPathRepository: LocalPathRepository,
  ) { }

  async execute(command: SavePhotoForPostCommand) {

    const loadedFilesResult: SuccessLoad | FiledLoad = await new Promise((resolve, reject) => {
      const writeStreams = new Map<string, WriteStream>();
      command.stream.subscribe({
        next: ({ chunkData, filename, userId, postId }) => {
          try {
            if (!writeStreams.has(filename)) {
              const folder = join(__dirname, 'uploads', userId, 'posts', postId);
              if (!existsSync(folder)) mkdirSync(folder, { recursive: true });
              const filePath = join(folder, filename);
              const writeStream = createWriteStream(filePath);
              writeStreams.set(filename, writeStream);

            }
            writeStreams.get(filename)!.write(chunkData);
            this.localPathRepository.createLocalPath({ userId, postId, entity: 'post' })
            resolve({ success: true, message: 'Files uploaded successfully', userId, postId })
          } catch {
            console.log('catch error')
            reject({ success: false, message: 'Files uploaded filed', userId, postId });
          }

        },
        error: (err) => {
          console.error('Stream error:', err);
          cleanupAndReject(err);
        },
        complete: () => {
          console.log('Upload complete');
          writeStreams.forEach((ws) => ws.end());
          resolve({ success: true, message: 'Files uploaded successfully' } as FiledLoad);
        },
      });
      function cleanupAndReject(err: any) {
        writeStreams.forEach((ws) => ws.destroy());
        reject(new RpcException({ code: 13, message: 'Files upload failed', details: err?.message }));
      }
    });


    return loadedFilesResult
  }
}