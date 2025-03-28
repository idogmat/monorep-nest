import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { createWriteStream, existsSync } from 'fs';
import { ProfileService } from '../profile.service';
import path from 'path';
import { readFile, unlink } from 'fs/promises';
import { ClientProxy } from '@nestjs/microservices';
import { HttpStatus, Inject } from '@nestjs/common';


export class UploadProfilePhotoCommand {
  constructor(
    public req,
    public userId: string,
    public filename: string,
  ) {
  }
}

@CommandHandler(UploadProfilePhotoCommand)
export class UploadProfilePhotoUseCase implements ICommandHandler<UploadProfilePhotoCommand> {

  constructor(
    private readonly profileService: ProfileService,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,

  ) { }

  async execute(command: UploadProfilePhotoCommand) {
    const { req, userId, filename } = command

    const filePath = `./uploads/${filename}`;
    const writeStream = createWriteStream(filePath, { highWaterMark: 64 * 1024 });

    try {
      // Ожидаем завершения записи файла
      await new Promise((resolve, reject) => {
        req
          .pipe(writeStream)
          .on('error', reject)
          .on('finish', resolve as any)
          .on('error', reject);
      });

      // Читаем файл после записи
      const buffer = await readFile(filePath);
      const fileInfo = {
        originalname: path.basename(filePath),
        buffer,
        mimetype: 'application/octet-stream',
      };

      // Загружаем в S3
      const folder = `profile/${userId}`;
      const uploadResult = await this.profileService.uploadImage(fileInfo, folder);
      const photoUrl = await this.profileService.getFileUrl(uploadResult.Key);

      // Отправляем сообщение в RabbitMQ
      const message = { photoUrl, userId, timestamp: new Date() };
      this.rabbitClient.emit('load_profile_photo', message);

      return HttpStatus.OK;

    } catch (error) {
      console.error('Upload failed:', error);
      return HttpStatus.BAD_REQUEST;

    } finally {
      try {
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (unlinkError) {
        console.warn('Temp file cleanup failed:', unlinkError);
      }
    }
  }

}