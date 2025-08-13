import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { createWriteStream, existsSync, promises as fs, mkdirSync, WriteStream } from 'fs';
import { RpcException } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { join } from 'path';

interface SuccessLoad {
  success: boolean;
  message: string;
  userId: string;
  filename?: string
}
interface FiledLoad {
  success: boolean;
  message: string;
  userId: string;
}
export class SavePhotoForProfileCommand {
  constructor(
    public stream: Observable<{ chunkData: Buffer; filename: string; userId: string }>,
  ) {
  }
}

@CommandHandler(SavePhotoForProfileCommand)
export class SavePhotoForProfileUseCase implements ICommandHandler<SavePhotoForProfileCommand> {

  constructor(
  ) { }

  async execute(command: SavePhotoForProfileCommand) {

    const loadedFilesResult: SuccessLoad | FiledLoad = await new Promise((resolve, reject) => {
      const writeStreams = new Map<string, WriteStream>();
      command.stream.subscribe({
        next: ({ chunkData, filename, userId }) => {
          try {
            if (!writeStreams.has(filename)) {
              const folder = join(__dirname, 'uploads', userId, 'profile');
              if (!existsSync(folder)) mkdirSync(folder, { recursive: true });
              const filePath = join(folder, filename);
              const writeStream = createWriteStream(filePath);
              writeStreams.set(filename, writeStream);

            }
            writeStreams.get(filename)!.write(chunkData);
            // this.localPathRepository.createLocalPath({ userId, entity: 'post' })
            resolve({ success: true, message: 'Files uploaded successfully', userId, filename })
          } catch {
            console.log('catch error')
            reject({ success: false, message: 'Files uploaded filed', userId });
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