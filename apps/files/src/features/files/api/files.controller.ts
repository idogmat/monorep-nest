// src/files.controller.ts

import {
  BadRequestException,
  Controller,
  Headers,
  Inject,
  Post,
  Req,
  Res, UploadedFiles, UseInterceptors,
} from '@nestjs/common';
import { ClientProxy} from '@nestjs/microservices';
import { promises as fs } from 'fs'

import path, { join } from 'path';
import { createReadStream, createWriteStream, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { Request } from 'express';
import { ProfileService } from '../application/profile.service';
import { readFile } from 'fs/promises';
import { PostPhotoService } from '../application/post.photo.service';
import { diskStorage } from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  SignupCommand
} from '../../../../../gateway/src/feature/user-accounts/auth/application/use-cases/signup.use.case';
import { CreatePhotoForPostCommand } from '../application/use-cases/create.photo.for.post.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UploadResult } from '../../../common/types/upload.result';



@Controller()
export class FilesController {
  private chunkDir = './uploads/chunks';
  private readonly localFileName = 'test.png';
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    private readonly profileService: ProfileService,
    private commandBus: CommandBus,
  ) {
    if (!existsSync(this.chunkDir)) {
      mkdirSync(this.chunkDir, { recursive: true });
    }
  }



  @Post('upload_files')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }) as any
  )
  async handleFilesUpload(@UploadedFiles() files: Express.Multer.File[],
                          @Headers('X-UserId') userId: string,
  @Headers('X-PostId') postId: string) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files received');
    }

    return this.commandBus.execute(
      new CreatePhotoForPostCommand(files, userId, postId)
    );
  }

  @Post('receive')
  async uploadStream(
    @Req() req: Request,
    @Headers('x-filename') filename: string,
    @Headers('x-user') userId: string
  ) {
    const filePath = `./uploads/${filename}`
    const writeStream = createWriteStream(filePath, { highWaterMark: 64 * 1024 });
    console.log(userId)
    // Направляем поток запроса в поток записи файла
    try {
      await req
        .on('error', console.log)
        .pipe(writeStream)
        .on('error', console.log)
        .on('finish', async () => {
          const buffer = await readFile(filePath);
          // console.log(buffer)
          const fileInfo = {
            originalname: path.basename(filePath),
            buffer: buffer,
            mimetype: 'application/octet-stream',
          };
          const folder = `profile/${userId}`
          // 3. Загружаем в S3
          const uploadResult = await this.profileService.uploadImage(fileInfo, folder);
          console.log(uploadResult)

          // 4. Получаем URL загруженного файла
          const fileUrl = await this.profileService.getFileUrl(uploadResult.Key);
          const message = { fileUrl, userId, timestamp: new Date() };
          this.rabbitClient.emit('load_profile_photo', message); // Отправляем сообщение в очередь
          // return { message: 'Message sent to RabbitMQ', payload: message };
        })


      return 'ok'
    } catch (e) {

    }
  }



  @Post('receive-chunks')
  async receiveChunk(@Req() req: Request, @Res() res) {
    const chunkIndex = req.headers['x-chunk-index']; // Индекс чанка
    const totalChunks = req.headers['x-total-chunks']; // Всего чанков
    const fileId = req.headers['x-file-id']; // Уникальный ID файла

    if (!chunkIndex || !totalChunks || !fileId) {
      return res.status(400).json({ message: 'Missing chunk metadata' });
    }

    const chunkPath = join(this.chunkDir, `${fileId}_${chunkIndex}.chunk`);
    const writeStream = createWriteStream(chunkPath);

    req.pipe(writeStream);

    writeStream.on('finish', () => {
      console.log(`📦 Чанк ${chunkIndex}/${totalChunks} записан`);
      res.json({ message: `Chunk ${chunkIndex} received` });
    });
    req.on('finish', () => {
      console.log('finish file load')
    })

    writeStream.on('error', (err) => {
      console.error('❌ Ошибка сохранения чанка:', err);
      res.status(500).json({ message: 'Error saving chunk' });
    });
  }

  @Post('receive-chunks-merge')
  async receiveChunkMerge(@Req() req: Request, @Res() res) {
    const { fileId, fileName } = req.body;
    if (!fileId || !fileName) {
      return res.status(400).json({ message: 'Missing file metadata' });
    }

    const outputFilePath = `./uploads/${fileName}`;
    mergeChunks(fileId, outputFilePath);

    res.json({ message: 'File merge started' });
  }


}

export function mergeChunks(fileId: string, outputFilePath: string) {
  const chunkDir = `./uploads/chunks`;
  const chunkFiles = readdirSync(chunkDir)
    .filter((file) => file.startsWith(`${fileId}_`)) // Фильтруем чанки нужного файла
    .sort((a, b) => {
      const indexA = parseInt(a.split('_')[1]);
      const indexB = parseInt(b.split('_')[1]);
      return indexA - indexB;
    });

  const writeStream = createWriteStream(outputFilePath);

  function appendChunk(index: number) {
    if (index >= chunkFiles.length) {
      console.log('✅ Файл успешно собран:', outputFilePath);
      // После сборки удаляем чанки
      chunkFiles.forEach((chunk) => unlinkSync(join(chunkDir, chunk)));
      return;
    }

    const chunkPath = join(chunkDir, chunkFiles[index]);
    const readStream = createReadStream(chunkPath);

    readStream.pipe(writeStream, { end: false });

    readStream.on('end', () => appendChunk(index + 1));
  }

  appendChunk(0);
}