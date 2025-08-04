import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPrismaRepository } from '../../infrastructure/prisma/posts.prisma.repository';
import { PhotoUploadStatus } from '../../../../../prisma/generated/post-client';

export class CreatePostCommand {
  constructor(
    public description: string,
    public userId: string,
    public photoUploadStatus: PhotoUploadStatus) {
  }
}
@CommandHandler(CreatePostCommand)
export class CreatePostUseCases implements ICommandHandler<CreatePostCommand> {
  constructor(private postsPrismaRepository: PostsPrismaRepository) {
  }

  async execute(command: CreatePostCommand): Promise<string> {

    const newPost = await this.postsPrismaRepository.createPost(command.userId,
      command.description, command.photoUploadStatus);

    return newPost.id;
  }
}