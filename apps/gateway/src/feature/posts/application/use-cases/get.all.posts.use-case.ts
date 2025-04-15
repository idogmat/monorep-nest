import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GateService } from '../../../../common/gate.service';
import { PostsQueryRepository } from '../../infrastructure/prisma/posts-query-repository.service';
import { Post } from '../../../../../prisma/generated/client';
import { PostViewModel } from '../../api/model/output/post.view.model';
import { PaginationSearchPostTerm } from '../../api/model/input/query.posts.model';
import { PagedResponse } from '../../../../common/pagination/paged.response';

export class GetAllPostsCommand {
  constructor(
    public queryDto: PaginationSearchPostTerm,
    public userId: string,
  ) {
  }
}

@CommandHandler(GetAllPostsCommand)
export class GetAllPostsUseCase implements ICommandHandler<GetAllPostsCommand> {

  constructor(
    private readonly gateService: GateService,
    private readonly postsQueryRepository: PostsQueryRepository
  ) {
  }

  async execute(command: GetAllPostsCommand): Promise<PagedResponse<PostViewModel>> {

    try {
      const { items, totalCount, pageNumber, pageSize } = await this.postsQueryRepository.getAllPosts(command.userId, command.queryDto);

      const postIds = items.map(post => post.id);

      const { data } = await this.gateService.filesServicePost('postsPhoto', {
        postIds, // Массив ID постов
      }, {
        'X-UserId': command.userId, // Заголовок с ID пользователя
      });

      const viewDto = this.mapToViewModel(items, data);

      const pageResponse = new PagedResponse<PostViewModel>(viewDto, totalCount, pageNumber, pageSize);

      console.log("pageResponse", pageResponse);

      return pageResponse;

    } catch (error) {
      throw error;
    }


  }

  mapToViewModel(posts: Post[], dataOfPhoto: any): PostViewModel[] {

    return posts.map(post => {
      const mediaData = dataOfPhoto[post.id] || {};
      return {
        id: post.id,
        userId: post.authorId,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        photoUploadStatus: post.photoUploadStatus,
        description: post.title,
        photoUrls: mediaData.photoUrls || [],
      }
    })
  }
}