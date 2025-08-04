import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Post, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ContentClientService } from '../../../../support.modules/grpc/grpc.content.service';
import { AuthGuard } from '../../../../common/guard/authGuard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PostCreateModel } from './model/input/post.create.model';
import { PaginationSearchContentTerm } from './model/input/payments.query.model';
import { PaginationContentQueryDto } from './model/input/pagination.query';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@ApiTags('Content.Posts')
@Controller('content/posts')
export class ContentPostsController {
  constructor(
    private readonly contentGrpcClient: ContentClientService
  ) {

  }

  @Post()
  @UseGuards(AuthGuard)
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
    console.log(files)
    //сначала создаем пост в мс контент
    // const { id: postId } = await this.contentGrpcClient.createPost({
    //   userId,
    //   description: body.description,
    //   photoUploadStatus: 'PENDING'
    // });

    // console.log("answer contentGrpcClient.createPost", postId);


  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiQuery({ name: 'pageNumber', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortDirection', required: false })
  async getPost(
    @Req() req,
    @Query() queryDTO: PaginationContentQueryDto
  ) {
    const userId = req.user.userId;
    console.log("yo");
    const query = new PaginationSearchContentTerm(queryDTO, ['createdAt']);
    const res = await this.contentGrpcClient.getPosts({ ...query, userId });
    console.log(res);
    return res;

    //сначала создаем пост в мс контент
    // const { id: postId } = await this.contentGrpcClient.createPost({
    //   userId,
    //   description: body.description,
    //   photoUploadStatus: 'PENDING'
    // });

    // console.log("answer contentGrpcClient.createPost", postId);


  }
}