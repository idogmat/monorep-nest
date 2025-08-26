import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPrismaRepository } from '../../infrastructure/prisma/posts.prisma.repository';
import { RabbitService } from '../rabbit.service';
import { Inject } from '@nestjs/common';

export class ContentDeletePostCommand {
  constructor(
    public userId: string,
    public postId: string
  ) {
  }
}

@CommandHandler(ContentDeletePostCommand)
export class ContentDeletePostUseCase implements ICommandHandler<ContentDeletePostCommand> {
  constructor(
    private postsPrismaRepository: PostsPrismaRepository,
    @Inject('RABBIT_SERVICE') private readonly rabbitClient: RabbitService

  ) {
  }

  async execute(command: ContentDeletePostCommand): Promise<any> {
    const result = await this.postsPrismaRepository.delete(command.userId,
      command.postId);
    if (result.success) {
      const rabbit = await this.rabbitClient.publishToQueue('file_queue', {
        type: 'DELETE_POSTS_PHOTO',
        userId: command.userId,
        postId: command.postId,
        data: result,
        createdAt: new Date(),
      });
      console.log(rabbit)
    }
    return result;
  }
}