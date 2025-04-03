import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPrismaRepository } from '../../infrastructure/prisma/posts.prisma.repository';
import { InterlayerNotice } from '../../../../common/error-handling/interlayer.notice';
import { PostError } from '../../../../common/error-handling/post.error';
import { ENTITY_POST } from '../../../../common/entities.constants';
import { PostsQueryRepository } from '../../infrastructure/prisma/posts-query-repository.service';
import { PostViewModel } from '../../api/model/output/post.view.model';

export class UpdatePostCommand{
  constructor(
    public postId: string,
    public userId: string,
    public description: string
  ) {
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand>{
  constructor(private postsPrismaRepository: PostsPrismaRepository,
              private postsQueryRepository: PostsQueryRepository) {
  }

  async execute(command: UpdatePostCommand): Promise<InterlayerNotice<PostViewModel>>{

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
    foundPost.title = command.description;
    await this.postsPrismaRepository.updatePost({id: command.postId, data: foundPost});
    return new InterlayerNotice(await this.postsQueryRepository.getPostById({id: command.postId}));
  }
}