// src/files.controller.ts
import {
  BadRequestException, Body,
  Controller, Get,
  Headers,
  Param,
  Post,
  Req,
  Res, UploadedFiles, UseInterceptors,
} from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { join } from 'path';
import { createReadStream, createWriteStream, existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync, WriteStream } from 'fs';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePhotoForPostCommand } from '../application/use-cases/create.photo.for.post.use-case';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { UploadProfilePhotoCommand } from '../application/use-cases/upload.profile.photo.use-case';
import { FilesQueryRepository } from '../infrastructure/files.query-repository';
import { LocationViewModel } from './model/output/location.view.model';
import { Observable } from 'rxjs';
import { SavePhotoForPostCommand } from '../application/use-cases/save.photo.for.post.use-case';
import { LoadFilesEvent } from '../application/event-bus/load.files.post.event';
import { SavePhotoForProfileCommand } from '../application/use-cases/save.photo.profile.use-case';
import { SaveFileForChatCommand } from '../application/use-cases/save.file.chat.use-case';
import { UploadChatFileCommand } from '../application/use-cases/upload.chat.file.use-case';


@Controller()
export class FilesController {
  private chunkDir = './uploads/chunks';
  private readonly localFileName = 'test.png';
  constructor(
    private readonly filesQueryRepository: FilesQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,

  ) {
    if (!existsSync(this.chunkDir)) {
      mkdirSync(this.chunkDir, { recursive: true });
    }
  }

  @GrpcStreamMethod('FileService', 'Upload')
  async uploadFiles(
    stream$: Observable<{ chunkData: Buffer; filename: string; userId: string, postId: string }>
  ): Promise<{ success: boolean; message: string }> {

    const loadedFilesResult = await this.commandBus.execute(
      new SavePhotoForPostCommand(stream$)
    );
    return loadedFilesResult;

  }

  @GrpcMethod('FileService', 'LoadOnS3')
  async LoadOnS3(
    req: { userId: string, postId: string }
  ): Promise<any> {

    if (req?.userId && req?.postId)
      this.eventBus.publish(new LoadFilesEvent(
        req.userId,
        req.postId
      ));
    return { success: true, message: 'Files uploaded successfully' }
  }

  @GrpcStreamMethod('FileService', 'UploadProfile')
  async UploadProfile(
    stream$: Observable<{ chunkData: Buffer; filename: string; userId: string }>
  ): Promise<any> {
    const loadedFilesResult = await this.commandBus.execute(
      new SavePhotoForProfileCommand(stream$)
    );
    if (!loadedFilesResult?.filename) return { success: true, message: 'Files uploaded successfully' }
    await this.commandBus.execute(
      new UploadProfilePhotoCommand(loadedFilesResult.userId, loadedFilesResult?.filename)
    );
    console.log(loadedFilesResult)
    return loadedFilesResult;
  }

  @GrpcStreamMethod('FileService', 'UploadChatFile')
  async UploadFileForChat(
    stream$: Observable<{ chunkData: Buffer; filename: string; senderId: string, userId: string }>
  ): Promise<any> {
    const loadedFilesResult = await this.commandBus.execute(
      new SaveFileForChatCommand(stream$)
    );
    if (!loadedFilesResult?.filename) return { success: true, message: 'Files uploaded successfully' }
    await this.commandBus.execute(
      new UploadChatFileCommand(
        loadedFilesResult.senderId,
        loadedFilesResult.userId,
        loadedFilesResult?.filename
      )
    );
    console.log(loadedFilesResult, 'loadedFilesResult')
    return loadedFilesResult;
  }

  @Post('postsPhoto')
  async getPostsAndPhotos(
    @Body('postIds') postIds: string[],
    @Headers('X-UserId',
    ) userId: string
  ) {

    return this.filesQueryRepository.getPostsMedia(userId, postIds);

  }


  @Get(':postId')
  async getPostPhotos(
    @Param('postId') postId: string
  ): Promise<LocationViewModel> {
    return this.filesQueryRepository.getLocationByPostId(postId);
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
      new CreatePhotoForPostCommand(userId, postId)
    );
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