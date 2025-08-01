import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreatePostRequest } from '../../../gateway/src/support.modules/grpc/interfaces/content.interface';
import { CommandBus } from '@nestjs/cqrs';
import { ContentCreatePostCommand } from '../features/posts/application/use-cases/content.create.post.use.cases';

@Controller()
export class ContentController{
  constructor(
    private commandBus: CommandBus,

  ) {
  }

  @GrpcMethod('PostService', 'CreatePost')
  async createPost(
    data: CreatePostRequest
  ) {

    try {
      return await this.commandBus.execute(
        new ContentCreatePostCommand(data.description, data.userId, data.photoUploadStatus),
      );
    } catch (error) {
      console.log(error)
      return null;
    }
  }
}