// src/files.controller.ts

import { Body, Controller, Get, Headers, HttpStatus, Inject, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ClientProxy, EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { FilesService } from '../application/files.service';
import { UploadSummaryResponse } from '../../../common/types/upload.summary.response';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { createReadStream, createWriteStream, existsSync, mkdirSync, readdirSync, unlinkSync, writeFile } from 'fs';
import { memoryStorage } from 'multer';
import { pipeline } from 'stream/promises';
import { unlink } from 'fs/promises';
import { Request } from 'express';
import { promisify } from 'util';
const pipelineAsync = promisify(pipeline);
@Controller()
export class FilesController {
  private chunkDir = './uploads/chunks';
  private readonly localFileName = 'test.png';
  constructor(
    // @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    private readonly filesService: FilesService
  ) {
    if (!existsSync(this.chunkDir)) {
      mkdirSync(this.chunkDir, { recursive: true });
    }
  }


  @MessagePattern('upload_files')
  async handleFilesUpload(@Payload() data: { files: Express.Multer.File[], postId: string, userId: string }): Promise<UploadSummaryResponse> {
    console.log("Hi");
    const { files, postId, userId } = data;
    return this.filesService.sendPhoto(userId, postId, files);
  }

  @Post('receive')
  // @UseInterceptors(FileInterceptor('file'))
  async uploadStream(
    // @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Headers('x-filename') filename: string
  ) {
    const writeStream = createWriteStream(`./uploads/${filename}`, { highWaterMark: 10000 });

    // Направляем поток запроса в поток записи файла
    await req
      .on('error', console.log)
      .pipe(writeStream)
      .on('error', console.log);


    return 'ok'
    // console.log(file)
    // console.log(filename)
    // console.log(req)
    // const writeStream = createWriteStream('./uploads/' + file.originalname);
    // file.stream.pipe(writeStream);

    // return new Promise((resolve) => {
    //   writeStream.on('finish', () => resolve({ status: 'ok' }));
    // });
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