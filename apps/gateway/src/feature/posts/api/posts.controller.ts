import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
import { Request } from 'express';
import { GetAllPostsCommand } from '../application/use-cases/get.all.posts.use-case';
import { PostUpdateModel } from './model/input/post.update.model';
import { UpdatePostCommand } from '../application/use-cases/update.post.use-case';
import { DeletePostCommand } from '../application/use-cases/delete.post.use-case';
import { PaginationPostQueryDto } from './model/input/pagination.post.query.dto';
import { PaginationSearchPostTerm } from './model/input/query.posts.model';
import { PagedResponse } from '../../../common/pagination/paged.response';
import { PostViewModel } from './model/output/post.view.model';
import { PagedResponseOfPosts } from './model/output/paged.response.of.posts.model';



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
  @ApiOperation({ summary: 'Create a new post' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Post created successfully' })
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
  @ApiOperation({ summary: 'Update an existing post' })
  @ApiResponse({ status: 200, description: 'Post updated' })
  @ApiResponse({ status: 403, description: 'Forbidden to update' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiBody({ type: PostUpdateModel })
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

  @Get()
  @UseGuards(AuthGuardOptional)
  @ApiOperation({ summary: 'Get a list of posts with pagination' })
  @ApiQuery({ name: 'pageNumber', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortDirection', required: false })
  @ApiQuery({ name: 'description', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched posts',
    type: PagedResponseOfPosts,  // Указываем PagedResponse без указания типа
  })

  async getPosts(
    @Req() req: Request,
    @Query()
    queryDTO: PaginationPostQueryDto): Promise<PagedResponse<PostViewModel>>{

    const pagination = new PaginationSearchPostTerm(queryDTO, ['createdAt', 'description']);
    const userId = req.user?.userId || ''
    return await this.commandBus.execute(
      new GetAllPostsCommand(pagination, userId)
    )
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update an existing post' })
  @ApiParam({ name: 'postId', type: 'string', format: 'uuid', description: 'Post UUID' })
  @ApiBody({ type: PostUpdateModel })
  @ApiResponse({ status: 200, description: 'Post updated' })
  @ApiResponse({ status: 403, description: 'Forbidden to update' })
  @ApiResponse({ status: 404, description: 'Post not found' })
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
    return result.data;
  }

  @UseGuards(AuthGuard)
  @Delete(':postId')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'postId', type: 'string', format: 'uuid', description: 'Post UUID' })
  @ApiResponse({ status: 204, description: 'Post deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden to delete' })
  @ApiResponse({ status: 404, description: 'Post not found' })
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