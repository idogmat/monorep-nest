import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPrismaRepository } from '../../infrastructure/prisma/posts.prisma.repository';
import { PostViewModel } from '../../api/model/output/post.view.model';
import { GateService } from '../../../../../../gateway/src/common/gate.service';
import { InterlayerNotice } from '../../../../../../libs/common/error-handling/interlayer.notice';
import { PostError } from '../../../../../../libs/common/error-handling/post.error';
import { ENTITY_POST } from '../../../../../../libs/common/entities.constants';
import { PostsQueryRepository } from '../../infrastructure/prisma/posts-query-repository.service';

export class GetPostAndPhotoCommand {
  constructor(
    public postId: string,

  ) { }
}

@CommandHandler(GetPostAndPhotoCommand)
export class GetPostAndPhotoUseCase implements ICommandHandler<GetPostAndPhotoCommand> {
  constructor(
    private readonly postsPrismaRepository: PostsPrismaRepository,
    private readonly postsQueryRepository: PostsQueryRepository
  ) { }

  async execute(command: GetPostAndPhotoCommand): Promise<InterlayerNotice<PostViewModel | null>> {
    const foundPost = await this.postsPrismaRepository.findById(command.postId);
    if (!foundPost) {
      return InterlayerNotice.createErrorNotice(
        PostError.NOT_FOUND_POST,
        ENTITY_POST,
        404
      )

    }

    const viewModel = await this.postsQueryRepository.getPostById(command.postId)

    return new InterlayerNotice(viewModel);

  }


}