// src/files.controller.ts

import { Controller, Headers, Inject, Post, Req, Res } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { FilesService } from '../application/files.service';
import { UploadSummaryResponse } from '../../../common/types/upload.summary.response';
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


import { readFile, unlink } from 'fs/promises';

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
    @Res() res,
    @Headers('x-filename') filename: string,
    @Headers('x-user') userId: string
  ) {
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
      const fileUrl = await this.profileService.getFileUrl(uploadResult.Key);

      // Отправляем сообщение в RabbitMQ
      const message = { fileUrl, userId, timestamp: new Date() };
      this.rabbitClient.emit('load_profile_photo', message);

      return res.status(200).send({ url: fileUrl });

    } catch (error) {
      console.error('Upload failed:', error);
      return res.status(500).send('File processing error');

    } finally {
      // Удаляем временный файл в любом случае
      try {
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (unlinkError) {
        console.warn('Temp file cleanup failed:', unlinkError);
      }
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