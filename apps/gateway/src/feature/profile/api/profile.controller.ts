import { ApiTags } from '@nestjs/swagger';
import { Controller, Inject, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream, createWriteStream, unlinkSync } from 'fs';
import { diskStorage } from 'multer';


@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(

  ) {
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './tmp',
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    }),
  }))
  async uploadStream(@UploadedFile() file: Express.Multer.File) {
    // 1. Создаем поток ЧТЕНИЯ из временного файла
    const readStream = createReadStream(file.path);

    // 2. Создаем поток ЗАПИСИ в целевую директорию
    const writeStream = createWriteStream(`./uploads/${file.originalname}`);

    // 3. Передаем данные через потоки
    readStream.pipe(writeStream);

    return new Promise((resolve, reject) => {
      // 4. Удаляем временный файл после успешной записи
      writeStream.on('finish', () => {
        unlinkSync(file.path); // Удаляем временный файл
        resolve({ status: 'ok' });
      });

      // 5. Обрабатываем ошибки
      writeStream.on('error', (error) => {
        unlinkSync(file.path); // Удаляем временный файл даже при ошибке
        reject(error);
      });
    });
  }



}