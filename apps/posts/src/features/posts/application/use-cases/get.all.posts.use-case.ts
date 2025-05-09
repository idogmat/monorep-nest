import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/prisma/posts-query-repository.service';
import { PostViewModel } from '../../api/model/output/post.view.model';
import { PagedResponse } from '../../../../../../gateway/src/common/pagination/paged.response';
import { Post } from '../../../../../prisma/generated/post-client';
import { PaginationSearchPostTerm } from '../../../../../../libs/common/pagination/query.posts.model';

export class GetAllPostsCommand {
  constructor(
    public queryDto: PaginationSearchPostTerm,
  ) {
  }
}

@CommandHandler(GetAllPostsCommand)
export class GetAllPostsUseCase implements ICommandHandler<GetAllPostsCommand> {

  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {
  }

  async execute(command: GetAllPostsCommand): Promise<PagedResponse<PostViewModel>> {

      const {
        mappedItems,
        totalCount,
        pageNumber,
        pageSize,
      } = await this.postsQueryRepository.getAllPosts(command.queryDto);

       const pageResponse = new PagedResponse<PostViewModel>(mappedItems, totalCount, +pageNumber, +pageSize);

       console.log('pageResponse', pageResponse);

       return pageResponse;

  }

  mapToViewModel(posts: Post[], dataOfPhoto: any): PostViewModel[] {

    return posts.map(post => {
      const mediaData = dataOfPhoto[post.id] || {};
      return {
        id: post.id,
        userId: post.userId,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        photoUploadStatus: post.photoUploadStatus,
        description: post.title,
        photoUrls: mediaData.photoUrls || [],
      };
    });
  }
}