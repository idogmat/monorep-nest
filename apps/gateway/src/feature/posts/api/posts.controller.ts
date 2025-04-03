import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller, Delete, Get,
  Inject, Param, ParseUUIDPipe,
  Post, Put, Query,
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
import {
  UpdatePostStatusOnFileUploadCommand
} from '../application/use-cases/update.post.status.on.file.upload.use-case';
import { GetPostAndPhotoCommand } from '../application/use-cases/get.post.and.photo.use-case';
import { AuthGuardOptional } from '../../../common/guard/authGuardOptional';
import { PaginationSearchPostTerm} from './model/input/query.posts.model';
import { Request } from 'express';
import { GetAllPostsCommand } from '../application/use-cases/get.all.posts.use-case';
import { PostUpdateModel } from './model/input/post.update.model';
import { UpdatePostCommand } from '../application/use-cases/update.post.use-case';
import { DeletePostCommand } from '../application/use-cases/delete.post.use-case';



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

  @Post()
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
      new CreatePostCommand(postCreateModel.description, userId, 'IN_PROGRESS')
    )

    const result = await this.commandBus.execute(
      new UploadPostPhotosCommand(files, userId, postId)
    )

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }

  @UseGuards(AuthGuardOptional)
  @Get(':postId')
  async getPost(@Param('postId', new ParseUUIDPipe()) postId: string,
                @Req() req,){

    const userId = req.user?.userId || ''
    const result = await this.commandBus.execute(
      new GetPostAndPhotoCommand(postId, userId)
    )
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
    return result.data;
  }

  @UseGuards(AuthGuardOptional)
  @Get()
  async getPosts(
    @Req() req: Request,
    @Query()
    queryDTO: PaginationSearchPostTerm){

    const userId = req.user?.userId || ''
    return await this.commandBus.execute(
      new GetAllPostsCommand(queryDTO, userId)
    )
  }

  @UseGuards(AuthGuard)
  @Put(':postId')
  async updatePost(@Param('postId', new ParseUUIDPipe()) postId: string,
                @Body() updateModel: PostUpdateModel,
                @Req() req: Request,){

    const userId = req.user.userId;
    const result = await this.commandBus.execute(
      new UpdatePostCommand(postId, userId, updateModel.description)
    )
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':postId')
  async deletePost(@Param('postId', new ParseUUIDPipe()) postId: string,
                   @Req() req: Request,){

    const userId = req.user.userId;
    const result = await this.commandBus.execute(
      new DeletePostCommand(postId, userId)
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
    await this.commandBus.execute(
      new UpdatePostStatusOnFileUploadCommand(postId, files)
    )
  }
}