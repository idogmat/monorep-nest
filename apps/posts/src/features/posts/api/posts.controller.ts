import {
  BadRequestException, Body,
  Controller, Delete, Get,
  Headers,
  Post, Put, Query, Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreatePostCommand } from '../application/use-cases/create.post.use.cases';
import { UploadPostPhotosCommand } from '../application/use-cases/upload.post.photos.use-case';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import {
  UpdatePostStatusOnFileUploadCommand
} from '../application/use-cases/update.post.status.on.file.upload.use-case';
import { FilesUploadedEvent } from './model/interfaces/files-uploaded-event.interface';
import { PostsQueryRepository } from '../infrastructure/prisma/posts-query-repository.service';
import { GetPostAndPhotoCommand } from '../application/use-cases/get.post.and.photo.use-case';
import { GetAllPostsCommand } from '../application/use-cases/get.all.posts.use-case';
import { PaginationSearchPostTerm } from '../../../../../libs/common/pagination/query.posts.model';
import { PostUpdateModel } from '../../../../../gateway/src/feature/posts/api/model/input/post.update.model';
import { ErrorProcessor } from '../../../../../libs/common/error-handling/error.processor';
import { UpdatePostCommand } from '../application/use-cases/update.post.use-case';
import { DeletePostCommand } from '../application/use-cases/delete.post.use-case';
import { PostsPrismaRepository } from '../infrastructure/prisma/posts.prisma.repository';


@Controller()
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private postsQueryRepository: PostsQueryRepository,
    private readonly postsPrismaRepository: PostsPrismaRepository,
  ) {
  }

  @Post('create-post')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }) as any,
  )
  async createPost(
    @UploadedFiles() files: Express.Multer.File[],
    @Headers('X-UserId') userId: string,
    @Req() req) {

    if (!files || files.length === 0) {
      throw new BadRequestException('No files received');
    }

    const rawPostData = req.body.postData;
    let postData;
    try {
      postData = JSON.parse(rawPostData);
    } catch (e) {
      throw new Error('Invalid postData JSON');
    }

    const postId = await this.commandBus.execute(
      new CreatePostCommand(postData.description, userId, 'IN_PROGRESS'),
    );

    const result = await this.commandBus.execute(
      new UploadPostPhotosCommand(files, userId, postId),
    );

    return this.postsQueryRepository.getPostById(postId);

  }

  @Get('get-post-by-id')
  async getPostById(
    @Headers('X-PostId') postId: string,
  ) {
    const result = await this.commandBus.execute(
      new GetPostAndPhotoCommand(postId),
    );

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }

    return result.data;

  }

  @Get('get-posts')
  async getPosts(
    @Query()
    queryDTO: PaginationSearchPostTerm,
  ) {

    const result = await this.commandBus.execute(
      new GetAllPostsCommand(queryDTO),
    );

    return result;

  }

  @Put('update-post')
  async updatePost(
    @Headers('X-PostId') postId: string,
    @Headers('X-UserId') userId: string,
    @Body() updateModel: PostUpdateModel
  ) {

    const result = await this.commandBus.execute(
      new UpdatePostCommand(postId, userId, updateModel),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
    return result.data;
  }

  @Delete('delete-post')
  async deletePost(
    @Headers('X-PostId') postId: string,
    @Headers('X-UserId') userId: string,
  ) {

    const result = await this.commandBus.execute(
      new DeletePostCommand(postId, userId),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }
  @EventPattern('files_uploaded')
  async handleFileUploaded(@Payload() data: FilesUploadedEvent,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Ctx() context: any) {
    console.log('Received file uploaded message:', data);
    const { postId, files } = data;
    try {
      await this.commandBus.execute(
        new UpdatePostStatusOnFileUploadCommand(postId, files)
      )
    } catch (error) {
      console.error('Ошибка в команде:', error);
    }

  }

  @EventPattern('ban_posts')
  async banPosts(
    @Payload() userId: string,
  ) {
    try {
      console.log(userId, 'ban_posts')
      if (!userId) return;
      await this.postsPrismaRepository.markAsBanned(userId)
    } catch (error) {
      console.error('Ошибка в команде:', error);
    }

  }
}
