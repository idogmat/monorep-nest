import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Inject, Param, Post, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ContentClientService } from '../../../../support.modules/grpc/grpc.content.service';
import { AuthGuard } from '../../../../common/guard/authGuard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PostCreateModel } from './model/input/post.create.model';
import { PaginationSearchContentTerm } from './model/input/payments.query.model';
import { PaginationContentQueryDto } from './model/input/pagination.query';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { FilesClientService } from '../../../../support.modules/grpc/grpc.files.service';
import { SendFileService } from '../../../../support.modules/file/file.service';
import { CommentCreateModel } from '../../comments/api/model/input/comment.create.model';
import { ApiFileWithDto, GetPostsApiQuery } from './model/input/swagger.discription.ts';
import { PostOutputModel } from './model/output/post.output.model';
import { Request } from 'express';

@ApiTags('Content.Posts')
@Controller('content/posts')
export class ContentPostsController {
  constructor(
    private readonly contentGrpcClient: ContentClientService,
    private readonly filesClientService: FilesClientService,
    @Inject('SEND_FILE_SERVICE') private readonly sendFileService: SendFileService,
  ) {

  }


  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiFileWithDto(PostCreateModel, 'files')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = join(__dirname, 'tmp', `${req.user.userId}`);

        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
      },
      filename: (req, file, cb) => cb(null, `${file.originalname}`),
    }),
  }))
  async createPost(
    @Req() req,
    @Body() body: PostCreateModel,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const userId = req.user.userId;
    // console.log(files)
    try {
      const post = await this.contentGrpcClient.createPost({
        userId,
        description: body.description,
        photoUploadStatus: 'PENDING'
      });
      console.log(post)
      const res = await this.sendFileService.uploadFilesGrpc(files, req.user.userId, post.id);

      console.log(res, 'resupload')
      await this.filesClientService.loadOnS3(userId, post.id);

    } catch (error) {
      console.log(error, 'error')
    }
  }

  @ApiBody({ type: CommentCreateModel })
  @ApiBearerAuth()
  @Post(":id/comments")
  @UseGuards(AuthGuard)
  async createComment(
    @Param('id') postId: string,
    @Req() req,
    @Body() body: CommentCreateModel,
  ) {
    const userId = req.user.userId;

    // console.log(userId);
    // console.log(body);
    try {
      const comment = await this.contentGrpcClient.createComment({
        userId,
        postId,
        message: body.message,
      });
      return comment
    } catch (error) {
      console.log(error, 'error')
    }
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched post',
    type: PostOutputModel
  })
  async getPost(
    @Req() req,
    @Param('id') postId: string,
  ) {
    const userId = req.user.userId;
    // console.log('ok')
    const res = await this.contentGrpcClient.getPost({ postId });
    console.log(res);
    return res;
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Successfully delete post',
  })
  async deletePost(
    @Req() req: Request,
    @Param('id') postId: string,
  ) {
    const userId = req.user.userId;
    // console.log('ok')
    const res = await this.contentGrpcClient.deletePost({ userId, postId });
    console.log(res);
    return res;
  }

  @Get()
  @UseGuards(AuthGuard)
  @GetPostsApiQuery()
  async getPosts(
    @Req() req,
    @Query() queryDTO: PaginationContentQueryDto
  ) {
    const userId = req.user.userId;
    console.log("yo");
    const query = new PaginationSearchContentTerm(queryDTO, ['createdAt']);
    const res = await this.contentGrpcClient.getPosts({ ...query, userId });
    console.log(res);
    return res;
  }
}