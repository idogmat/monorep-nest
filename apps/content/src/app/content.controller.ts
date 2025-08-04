import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreatePostRequest } from '../../../gateway/src/support.modules/grpc/interfaces/content.interface';
import { CommandBus } from '@nestjs/cqrs';
import { ContentCreatePostCommand } from '../features/posts/application/use-cases/content.create.post.use.cases';
import { GetPostsQueryRequest } from '../../../libs/proto/generated/content';
import { ContentGetPostCommand } from '../features/posts/application/use-cases/content.get.post.use.case';

@Controller()
export class ContentController {
  constructor(
    private commandBus: CommandBus,

  ) {
  }

  @GrpcMethod('PostService', 'CreatePost')
  async createPost(
    data: CreatePostRequest
  ) {
    console.log(data, 'data')
    try {
      return await this.commandBus.execute(
        new ContentCreatePostCommand(data.description, data.userId, data.photoUploadStatus),
      );
    } catch (error) {
      console.log(error)
      return null;
    }
  }

  @GrpcMethod('PostService', 'GetPosts')
  async getPosts(
    data: GetPostsQueryRequest
  ) {
    const res = await this.commandBus.execute(
      new ContentGetPostCommand(
        data.sortBy,
        data.sortDirection,
        data.pageNumber,
        data.pageSize,
        data.userId
      )
    );
    return res
  }
}
