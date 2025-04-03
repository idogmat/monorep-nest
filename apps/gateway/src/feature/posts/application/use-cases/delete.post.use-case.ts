import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPrismaRepository } from '../../infrastructure/prisma/posts.prisma.repository';
import { InterlayerNotice } from '../../../../common/error-handling/interlayer.notice';
import { PostError } from '../../../../common/error-handling/post.error';
import { ENTITY_POST } from '../../../../common/entities.constants';

export class DeletePostCommand{
  constructor(
    public postId: string,
    public userId: string,
  ) {
  }
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand>{

  constructor(private postsPrismaRepository: PostsPrismaRepository) {
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

    if(foundPost.authorId!== command.userId){
      return InterlayerNotice.createErrorNotice(
        PostError.FORBIDDEN_UPDATE,
        ENTITY_POST,
        403
      )
    }

    await this.postsPrismaRepository.delete({id: command.postId});
  }
}