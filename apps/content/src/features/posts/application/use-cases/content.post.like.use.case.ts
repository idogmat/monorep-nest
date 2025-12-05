import { Like } from '../../../../../prisma/generated/content-client';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPrismaRepository } from '../../infrastructure/prisma/posts.prisma.repository';

export class ContentPostLikeCommand {
  constructor(
    public userId: string,
    public postId: string,
  ) {
  }
}

@CommandHandler(ContentPostLikeCommand)
export class ContentPostLikeUseCase implements ICommandHandler<ContentPostLikeCommand> {
  constructor(private postsPrismaRepository: PostsPrismaRepository) {
  }

  async execute(command: ContentPostLikeCommand): Promise<Like> {

    const newLike = await this.postsPrismaRepository.postLike(command.userId,
      command.postId);
    return newLike;
  }
}