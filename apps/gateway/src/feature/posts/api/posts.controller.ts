import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Inject, Post, Req, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PostCreateModel } from './model/input/post.create.model';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import multer from 'multer';


@ApiTags('Posts')
@Controller('posts')
export class PostsController{
  constructor(
    private commandBus: CommandBus,
    @Inject('TCP_SERVICE') private readonly client: ClientProxy
  ) {
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: multer.memoryStorage(),
      fileFilter: (_, file, cb) => {
        if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
          return cb(new Error('The file must be in JPEG or PNG format'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB

    })as any)
  @ApiOperation({ summary: 'Creating a post with image upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  async createPost(@Req() req, @Body() postCreateModel: PostCreateModel, @UploadedFiles() files: Express.Multer.File[]) {
    console.log('postCreateModel:', postCreateModel);
    console.log(files);
    const fileDetails = files.map((file) => ({
      fileBuffer: file.buffer,  // Получаем буфер из Multer
      fileName: file.filename,  // Имя файла
    }));
    try {
      console.log(this.client);
      // Отправляем массив файлов на микросервис files через TCP
      const response = await firstValueFrom(
        this.client.send('upload_files', { files: fileDetails })
      );
      console.log('Files uploaded successfully:', response);
      return { message: 'Post has been created', files: response.files };
    } catch (error) {
      console.error('Error while uploading files:', error);
      return { message: 'Error uploading files', error: error.message };
    }

  }
}