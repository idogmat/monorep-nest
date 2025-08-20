import { Comment, PhotoUploadStatus, Post } from '../../../../../prisma/generated/content-client';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPrismaRepository } from '../../infrastructure/prisma/posts.prisma.repository';
import { CreatePostCommand } from './create.post.use.cases';

export class ContentCreateCommentCommand {
  constructor(
    public userId: string,
    public postId: string,
    public message: string
  ) {
  }
}

@CommandHandler(ContentCreateCommentCommand)
export class ContentCreateCommentUseCase implements ICommandHandler<ContentCreateCommentCommand> {
  constructor(private postsPrismaRepository: PostsPrismaRepository) {
  }

  async execute(command: ContentCreateCommentCommand): Promise<Comment> {

    const newComment = await this.postsPrismaRepository.createComment(command.userId,
      command.postId, command.message);
    return newComment;
  }
}