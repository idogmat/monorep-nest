import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Inject, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PostCreateModel } from './model/input/post.create.model';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { AuthGuard } from '../../../common/guard/authGuard';
import { InterlayerNotice } from '../../../common/error-handling/interlayer.notice';
import { UploadSummaryResponse } from '../../../../../files/src/common/types/upload.summary.response';
import { ErrorProcessor } from '../../../common/error-handling/error.processor';
import { SignupCommand } from '../../user-accounts/auth/application/use-cases/signup.use.case';
import { CreatePostCommand } from '../application/use-cases/create.post.use.cases';


@ApiTags('Posts')
@Controller('posts')
export class PostsController {
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
    }) as any)
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
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async createPost(@Req() req, @Body() postCreateModel: PostCreateModel, @UploadedFiles() files: Express.Multer.File[]) {
    try {
      const postId = randomUUID();
      // Отправляем массив файлов на микросервис files через TCP
      const result = await firstValueFrom(
        this.client.send('upload_files', { files, postId, userId: req.user.userId })
      );

      if (result.error) {
        new ErrorProcessor(InterlayerNotice.createErrorNotice(result.text, "Files", 422)).handleError();
      }

      await this.commandBus.execute(
        new CreatePostCommand(postCreateModel.title, req.user.userId, postId)
      );

      if(result.files.length > 0){
        return { status: 207, message: result.text, files: result.files };
      }
      return { status: 201, message: result.text };
    } catch (error) {
      console.error('Error while uploading files:', error);
      return { message: 'Error uploading files', error: error.message };
    }

  }
}