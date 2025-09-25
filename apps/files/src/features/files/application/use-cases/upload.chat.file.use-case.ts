import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { join, basename } from 'path';
import { unlink } from 'fs/promises';
import { RabbitService } from '../rabbit.service';
import { Inject, Logger } from '@nestjs/common';
import { S3StorageAdapter } from '../s3.service';

export class UploadChatFileCommand {
  constructor(
    public senderId: string,
    public userId: string,
    public filename: string,
  ) { }
}

@CommandHandler(UploadChatFileCommand)
export class UploadChatFileUseCase implements ICommandHandler<UploadChatFileCommand> {
  private readonly logger = new Logger(UploadChatFileUseCase.name);

  constructor(
    @Inject('CHAT_BUCKET_ADAPTER') private s3Adapter: S3StorageAdapter,
    @Inject('RABBIT_SERVICE') private readonly rabbitClient: RabbitService
  ) { }

  async execute(command: UploadChatFileCommand) {
    const { userId, senderId, filename } = command;
    console.log('Your command:', command);
    // 1. Проверка наличия файла
    if (!filename) {
      throw new Error('Filename is required for chat file upload');
    }

    const folder = join(__dirname, 'uploads', senderId, 'chat', userId);
    const filePath = join(folder, filename);

    try {
      // 2. Чтение файла
      const buffer = await this.readFileWithRetry(filePath, 3, 500);

      // 3. Загрузка в S3
      const s3Path = `chat/${senderId}/${userId}`;
      const uploadResult = await this.s3Adapter.uploadFile(
        {
          originalname: basename(filePath),
          buffer,
          mimetype: this.getMimeType(filename),
        },
        s3Path
      );

      // 4. Публикация в RabbitMQ
      await this.rabbitClient.publishToQueue('chat_queue', {
        type: 'UPLOAD_CHAT_FILE',
        senderId,
        userId,
        data: uploadResult,
        createdAt: new Date(),
      });

      return uploadResult;

    } catch (error) {
      this.logger.error(`Failed to upload profile photo for user ${userId}: ${error.message}`, error.stack);
      throw error;
    } finally {
      // 5. Удаление файла только после завершения всех операций
      if (filename) {
        await this.safeDeleteFile(join(folder, filename)).catch(error => {
          this.logger.warn(`Failed to delete temporary file: ${error.message}`);
        });
      }
    }
  }

  private async readFileWithRetry(filePath: string, maxRetries: number, delayMs: number): Promise<Buffer> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.readFileAsync(filePath);
      } catch (error) {
        if (error.code === 'ENOENT' && attempt < maxRetries) {
          this.logger.warn(`File not found (attempt ${attempt}/${maxRetries}), retrying...`);
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        } else {
          throw error;
        }
      }
    }
    throw new Error(`File read failed after ${maxRetries} attempts`);
  }

  private async readFileAsync(path: string): Promise<Buffer> {
    const { readFile } = await import('fs/promises');
    return readFile(path);
  }

  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  private async safeDeleteFile(filePath: string): Promise<void> {
    try {
      const { access, constants } = await import('fs/promises');
      try {
        await access(filePath, constants.F_OK);
        await unlink(filePath);
        this.logger.log(`Temporary file deleted: ${filePath}`);
      } catch (accessErr) {
        if (accessErr.code !== 'ENOENT') {
          throw accessErr;
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.error(`Failed to delete file ${filePath}: ${error.message}`);
      }
    }
  }
}