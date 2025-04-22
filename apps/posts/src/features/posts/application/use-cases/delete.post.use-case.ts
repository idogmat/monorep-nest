import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPrismaRepository } from '../../infrastructure/prisma/posts.prisma.repository';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InterlayerNotice } from '../../../../../../libs/common/error-handling/interlayer.notice';
import { PostError } from '../../../../../../libs/common/error-handling/post.error';
import { ENTITY_POST } from '../../../../../../libs/common/entities.constants';

export class DeletePostCommand{
  constructor(
    public postId: string,
    public userId: string,
  ) {
  }
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand>{

  constructor(
    private postsPrismaRepository: PostsPrismaRepository,
    @Inject('RABBITMQ_POST_SERVICE') private readonly rabbitClient: ClientProxy,
    ) {
  }

  async execute(command: DeletePostCommand){

    const foundPost = await this.postsPrismaRepository.findById(command.postId);
    if(!foundPost){
      return InterlayerNotice.createErrorNotice(
        PostError.NOT_FOUND_POST,
        ENTITY_POST,
        404
      )
    }

    if(foundPost.userId!== command.userId){
      return InterlayerNotice.createErrorNotice(
        PostError.FORBIDDEN_UPDATE,
        ENTITY_POST,
        403
      )
    }

    await this.postsPrismaRepository.deletePostWithFiles({id: command.postId});

    const message = { postId: command.postId };
    this.rabbitClient.emit('post_deleted', message);
    return new InterlayerNotice(null);
  }
}