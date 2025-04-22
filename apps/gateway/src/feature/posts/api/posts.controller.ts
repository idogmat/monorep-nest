import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller, Delete, Get,
  Param, ParseUUIDPipe,
  Post, Put, Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PostCreateModel } from './model/input/post.create.model';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from '../../../common/guard/authGuard';
import { ErrorProcessor } from '../../../common/error-handling/error.processor';
import { CreatePostCommand } from '../application/use-cases/create.post.use.cases';
import { Request } from 'express';
import { PostUpdateModel } from './model/input/post.update.model';
import { PaginationPostQueryDto } from './model/input/pagination.post.query.dto';
import { PostViewModel } from './model/output/post.view.model';
import { PagedResponseOfPosts } from './model/output/paged.response.of.posts.model';
import { InterlayerNotice } from '../../../../../libs/common/error-handling/interlayer.notice';
import { PaginationSearchPostTerm } from '../../../../../libs/common/pagination/query.posts.model';
import { PostMicroserviceService } from '../application/services/post.microservice.service';


@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private postMicroserviceService: PostMicroserviceService
  ) {
  }


  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new post with files',
    description: 'Upload files (up to 10) with post data. Max file size 2MB each.',
  })
  @ApiBody({
    description: 'Post data with files',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Array of files (images)',
        },
        description: {
          type: 'string',
          description: 'Post description text',
          example: 'This is my awesome post!',
        },
        // Добавьте другие поля из PostCreateModel по аналогии
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Post created successfully', type: PostViewModel })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './tmp',
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
      }),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }) as any,
  )
  @UseGuards(AuthGuard)
  async createPost(
    @Req() req,
    @Body() postCreateModel: PostCreateModel,
    @UploadedFiles() files: Express.Multer.File[]
  ) {

    const userId = req.user.userId;

    const result = await this.commandBus.execute(
      new CreatePostCommand(userId, files, postCreateModel),
    ) as InterlayerNotice;

    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
    return result.data;

  }

  @Get(':postId')
  @ApiOperation({ summary: 'Get post by id' })
  @ApiResponse({ status: 200, description: 'Post updated', type: PostViewModel })
  @ApiResponse({ status: 403, description: 'Forbidden to update' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPost(
    @Param('postId', new ParseUUIDPipe()) postId: string,
  ) {

    return await this.postMicroserviceService.getPostById(postId);

  }

  @Get()
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
    queryDTO: PaginationPostQueryDto
  ) {

    const pagination = new PaginationSearchPostTerm(queryDTO, ['createdAt', 'description']);

    return await this.postMicroserviceService.getPosts(pagination);

  }

  @UseGuards(AuthGuard)
  @Put(':postId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing post' })
  @ApiParam({ name: 'postId', type: 'string', format: 'uuid', description: 'Post UUID' })
  @ApiBody({ type: PostUpdateModel })
  @ApiResponse({ status: 200, description: 'Post updated' })
  @ApiResponse({ status: 403, description: 'Forbidden to update' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async updatePost(@Param('postId', new ParseUUIDPipe()) postId: string,
    @Body() updateModel: PostUpdateModel,
    @Req() req: Request) {

    const userId = req.user.userId;

    const param = {
      postId,
      userId,
      updateDto: updateModel
    }
    const { data } = await this.postMicroserviceService.updatePost(param);

    return data;

  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Delete(':postId')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'postId', type: 'string', format: 'uuid', description: 'Post UUID' })
  @ApiResponse({ status: 204, description: 'Post deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden to delete' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async deletePost(@Param('postId', new ParseUUIDPipe()) postId: string,
    @Req() req: Request) {

    const userId = req.user.userId;

    const param = {
      postId,
      userId
    }

    await this.postMicroserviceService.deletePost(param);

  }

}