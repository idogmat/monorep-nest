import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPrismaRepository } from '../../infrastructure/prisma/posts.prisma.repository';
import { InterlayerNotice } from '../../../../common/error-handling/interlayer.notice';
import { PostError } from '../../../../common/error-handling/post.error';
import { ENTITY_POST } from '../../../../common/entities.constants';
import { GateService } from '../../../../common/gate.service';
import { LocationViewModel } from '../../../../../../files/src/features/files/api/model/output/location.view.model';
import { PostViewModel } from '../../api/model/output/post.view.model';
import { Post } from '@prisma/client';

export class GetPostAndPhotoCommand {
  constructor(
    public postId: string,
    public userId: string,

  ) { }
}

@CommandHandler(GetPostAndPhotoCommand)
export class GetPostAndPhotoUseCase implements ICommandHandler<GetPostAndPhotoCommand> {
  constructor(
    private readonly postsPrismaRepository: PostsPrismaRepository,
    private readonly gateService: GateService
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

    const response = await this.gateService.filesServicePost(foundPost.id, {}, '');
    const result = this.mapPostViewModel(foundPost, response?.data);

    return new InterlayerNotice(result);


  }

  private mapPostViewModel(post: Post, response: LocationViewModel): PostViewModel{
    return {
      id: post.id,
      userId: post.authorId,
      description: post.title,
      photoUrls: response.photoUrls,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }
  }
}