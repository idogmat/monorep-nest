import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreatePostRequest } from '../../../gateway/src/support.modules/grpc/interfaces/content.interface';
import { CommandBus } from '@nestjs/cqrs';
import { ContentCreatePostCommand } from '../features/posts/application/use-cases/content.create.post.use.case';
import { CreateCommentRequest, GetPostRequest, GetPostsQueryRequest } from '../../../libs/proto/generated/content';
import { ContentGetPostCommand } from '../features/posts/application/use-cases/content.get.post.use.case';
import { ContentCreateCommentCommand } from '../features/posts/application/use-cases/content.create.comment.use.case';
import { ContentGetPostsCommand } from '../features/posts/application/use-cases/content.get.posts.use.case';

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
      const post = await this.commandBus.execute(
        new ContentCreatePostCommand(data.description, data.userId, data.photoUploadStatus),
      );
      return post
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
      new ContentGetPostsCommand(
        data.sortBy,
        data.sortDirection,
        data.pageNumber,
        data.pageSize,
        data.userId
      )
    );
    return res
  }

  @GrpcMethod('PostService', 'GetPost')
  async getPost(
    data: GetPostRequest
  ) {
    console.log(data)
    const res = await this.commandBus.execute(
      new ContentGetPostCommand(data.postId)
    )
    return res
  }

  @GrpcMethod('CommentService', 'CreateComment')
  async createComment(
    data: CreateCommentRequest
  ) {
    console.log(data)
    const res = await this.commandBus.execute(
      new ContentCreateCommentCommand(
        data.userId,
        data.postId,
        data.message,
      )
    );
    console.log(res)
    return { success: true, data: 'ok' };
  }
}
