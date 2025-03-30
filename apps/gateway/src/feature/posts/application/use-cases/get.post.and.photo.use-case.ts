import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPrismaQueryRepository } from '../../infrastructure/prisma/posts.prisma.query-repository';
import { isHigherPrecedenceThanAwait } from '@typescript-eslint/eslint-plugin/dist/util';
import { PostsPrismaRepository } from '../../infrastructure/prisma/posts.prisma.repository';
import { InterlayerNotice } from '../../../../common/error-handling/interlayer.notice';
import { PostError } from '../../../../common/error-handling/post.error';
import { ENTITY_POST } from '../../../../common/entities.constants';

export class GetPostAndPhotoCommand{
  constructor(
    public postId: string,
    public userId: string,

  ) {}
}

@CommandHandler(GetPostAndPhotoCommand)
export class GetPostAndPhotoUseCase implements ICommandHandler<GetPostAndPhotoCommand>{
  constructor(private readonly postsPrismaRepository: PostsPrismaRepository) {


  }

  async execute(command: GetPostAndPhotoCommand){

    const foundPost = await this.postsPrismaRepository.findById(command.postId);
    if(!foundPost){
      return InterlayerNotice.createErrorNotice(
        PostError.NOT_FOUND_POST,
        ENTITY_POST,
        404
      )

    }

    // if(foundPost.authorId === command.userId){
    //
    // }

  }
}