import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostCreateModel } from '../../api/model/input/post.create.model';
import { UploadSummaryResponse } from '../../../../../../files/src/common/types/upload.summary.response';
import { PostsPrismaRepository } from '../../infrastructure/posts.prisma.repository';

export class CreatePostCommand{
  constructor(public title: string,
              public userId: string,
              public postId: string) {
  }
}
@CommandHandler(CreatePostCommand)
export class CreatePostUseCases implements ICommandHandler<CreatePostCommand>{
  constructor(private postsPrismaRepository: PostsPrismaRepository) {
  }

  async execute(command: CreatePostCommand){

    const newPost = await this.postsPrismaRepository.createPost(command.userId,
      command.postId, command.title);


  }
}