import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ContentClientService } from '../../../../support.modules/grpc/grpc.content.service';
import { AuthGuard } from '../../../../common/guard/authGuard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PostCreateModel } from './model/input/post.create.model';

@ApiTags('Content.Posts')
@Controller('content/posts')
export class ContentPostsController {
  constructor(
    private readonly contentGrpcClient: ContentClientService) {

  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './tmp',
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
      }),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }) as any,
  )
  async createPost(
    @Req() req,
    @Body() body: PostCreateModel,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const userId = req.user.userId;

    //сначала создаем пост в мс контент
    const { id: postId } = await this.contentGrpcClient.createPost({
      userId,
      description: body.description,
      photoUploadStatus: 'PENDING'
    });

    console.log("answer contentGrpcClient.createPost", postId);


  }
}