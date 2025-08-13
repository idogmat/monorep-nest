import { Injectable } from '@nestjs/common';
import { FilesRepository } from '../infrastructure/files.repository';
import { createWriteStream, WriteStream } from 'fs';
import { join } from 'path';



@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepository: FilesRepository
  ) {
  }
  async Upload(stream: any): Promise<{ success: boolean; message: string }> {
    let filename = '';
    let writeStream: WriteStream | null = null;

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => {
        if (!filename && chunk.filename) {
          filename = chunk.filename;

          const path = join(__dirname, 'uploads', filename);
          writeStream = createWriteStream(path);
        }

        if (writeStream) {
          writeStream.write(chunk.content);
        }
      });

      stream.on('end', () => {
        if (writeStream) {
          writeStream.end();
        }
        resolve({ success: true, message: 'File saved successfully' });
      });

      stream.on('error', (err) => {
        if (writeStream) {
          writeStream.close();
        }
        reject({ success: false, message: err.message });
      });
    });
  }
}