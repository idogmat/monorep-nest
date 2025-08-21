import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { join, basename } from 'path';
import { unlink } from 'fs/promises';
import { S3UploadPhotoService } from '../post.photo.service';
import { RabbitService } from '../rabbit.service';
import { ProfileService } from '../profile.service';
import { Inject, Logger } from '@nestjs/common';

export class UploadProfilePhotoCommand {
  constructor(
    public userId: string,
    public filename: string,
  ) { }
}

@CommandHandler(UploadProfilePhotoCommand)
export class UploadProfilePhotoUseCase implements ICommandHandler<UploadProfilePhotoCommand> {
  private readonly logger = new Logger(UploadProfilePhotoUseCase.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly uploadPhotoService: S3UploadPhotoService,
    @Inject('RABBIT_SERVICE') private readonly rabbitClient: RabbitService
  ) { }

  async execute(command: UploadProfilePhotoCommand) {
    const { userId, filename } = command;

    // 1. Проверка наличия файла
    if (!filename) {
      throw new Error('Filename is required for profile photo upload');
    }

    const folder = join(__dirname, 'uploads', userId, 'profile');
    const filePath = join(folder, filename);

    try {
      // 2. Чтение файла
      const buffer = await this.readFileWithRetry(filePath, 3, 500);

      // 3. Загрузка в S3
      const s3Path = `profile/user_${userId}`;
      const uploadResult = await this.uploadPhotoService.uploadImage(
        {
          originalname: basename(filePath),
          buffer,
          mimetype: this.getMimeType(filename),
        },
        s3Path
      );

      // 4. Публикация в RabbitMQ
      await this.rabbitClient.publishToQueue('profile_queue', {
        type: 'UPLOAD_PROFILE_PHOTO',
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