import {  ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PostCreateModel } from './model/input/post.create.model';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { AuthGuard } from '../../../common/guard/authGuard';
import { HttpService } from '@nestjs/axios';
import FormData from 'form-data';

import axios from 'axios';



@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly httpService: HttpService,
    @Inject('TCP_SERVICE') private readonly client: ClientProxy
  ) {
  }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './tmp',
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
      }),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }) as any
  )
  @UseGuards(AuthGuard)
  async createPost(@Req() req, @Body() postCreateModel: PostCreateModel, @UploadedFiles() files: Express.Multer.File[]) {

    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const postId = randomUUID();
    const userId = req.user.userId;
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file); // 👈 Имя должно совпадать с сервером
    });
    formData.append('postId', postId);
    formData.append('userId', userId);

    const headers = formData.getHeaders();
    headers['Content-Type'] = 'multipart/form-data';
    headers['X-UserId'] = userId;
    headers['X-PostId'] = postId;

    const result = await axios.post('http://localhost:3795/upload_files', formData, { headers });

    console.log("result", result);
      // if (result.data.error) {
      //   throw new BadRequestException(result.data.error.message);
      // }
      //
      // return { status: 201, message: result.data.message };
  }
}