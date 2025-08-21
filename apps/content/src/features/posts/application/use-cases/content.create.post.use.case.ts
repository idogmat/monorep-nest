import { PhotoUploadStatus, Post } from '../../../../../prisma/generated/content-client';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPrismaRepository } from '../../infrastructure/prisma/posts.prisma.repository';
import { CreatePostCommand } from './create.post.use.cases';

export class ContentCreatePostCommand {
  constructor(
    public title: string,
    public userId: string,
    public photoUploadStatus: PhotoUploadStatus
  ) {
  }
}

@CommandHandler(ContentCreatePostCommand)
export class ContentCreatePostUseCase implements ICommandHandler<ContentCreatePostCommand> {
  constructor(private postsPrismaRepository: PostsPrismaRepository) {
  }

  async execute(command: CreatePostCommand): Promise<Post> {

    const newPost = await this.postsPrismaRepository.createPost(command.userId,
      command.title, command.photoUploadStatus);
    return newPost;
  }
}