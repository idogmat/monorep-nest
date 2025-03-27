import {  ApiTags } from '@nestjs/swagger';
import {
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
import { ClientProxy, Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { AuthGuard } from '../../../common/guard/authGuard';
import { HttpService } from '@nestjs/axios';
import { UploadPostPhotosCommand } from '../application/use-cases/upload.post.photos.use-case';
import { ErrorProcessor } from '../../../common/error-handling/error.processor';
import { CreatePostCommand } from '../application/use-cases/create.post.use.cases';
import { PostsPrismaRepository } from '../infrastructure/prisma/posts.prisma.repository';



@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly httpService: HttpService,
    private readonly postsPrismaRepository: PostsPrismaRepository,
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
  async createPost(@Req() req,
                   @Body() postCreateModel: PostCreateModel,
                   @UploadedFiles() files: Express.Multer.File[]) {

    const userId = req.user.userId;

    const postId = await this.commandBus.execute(
      new CreatePostCommand(postCreateModel.title, userId, 'IN_PROGRESS')
    )

    const result = await this.commandBus.execute(
      new UploadPostPhotosCommand(files, userId, postId)
    )

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }

  @EventPattern('files_uploaded')
  async handleFileUploaded(@Payload() data: any,
                           @Ctx() context: any) {
    console.log('Received file uploaded message:', data);
    const { postId, files } = data;
    let status;
    if(files.length > 0 ){
      status = 'COMPLETED';
    } else {
      status = 'FAILED';
    }
    await this.postsPrismaRepository.updateStatusForPost(postId, status);

  }
}