import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostCreateModel } from '../../api/model/input/post.create.model';
import { UploadSummaryResponse } from '../../../../../../files/src/common/types/upload.summary.response';
import { PostsPrismaRepository } from '../../infrastructure/prisma/posts.prisma.repository';
import { PhotoUploadStatus } from '@prisma/client';

export class CreatePostCommand{
  constructor(public title: string,
              public userId: string,
              public photoUploadStatus: PhotoUploadStatus ) {
  }
}
@CommandHandler(CreatePostCommand)
export class CreatePostUseCases implements ICommandHandler<CreatePostCommand>{
  constructor(private postsPrismaRepository: PostsPrismaRepository) {
  }

  async execute(command: CreatePostCommand): Promise<string>{

    const newPost = await this.postsPrismaRepository.createPost(command.userId,
      command.title, command.photoUploadStatus);

    return newPost.id;
  }
}