import { PaginationSearchPostTerm } from '../../api/model/input/query.posts.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GateService } from '../../../../common/gate.service';
import { PostsQueryRepository } from '../../infrastructure/prisma/posts-query-repository.service';
import { Post } from '@prisma/client';
import { PostViewModel } from '../../api/model/output/post.view.model';

export class GetAllPostsCommand{
  constructor(
    public queryDto: PaginationSearchPostTerm,
    public userId: string,
  ) {
  }
}

@CommandHandler(GetAllPostsCommand)
export class GetAllPostsUseCase implements  ICommandHandler<GetAllPostsCommand>{

  constructor(private readonly gateService: GateService,
              private readonly postsQueryRepository: PostsQueryRepository ) {
  }

  async execute(command: GetAllPostsCommand): Promise<PostViewModel[]>{

    try{
      const { data} = await this.gateService.filesServiceGet('postsPhoto', {
        'X-UserId': command.userId
      }) ;

      const posts = await this.postsQueryRepository.getAllPosts(command.userId);

      const viewDto = this.mapToViewModel(posts, data);
      console.log("viewDto", viewDto);
      return viewDto;

    } catch (error){
      throw error;
    }


  }

  mapToViewModel(posts: Post[], dataOfPhoto: any ): PostViewModel[]{

    console.log("posts", posts);
    console.log("dataOfPhoto", dataOfPhoto);
    return posts.map(post => {
      const mediaData = dataOfPhoto[post.id] || {};
      return{
        id: post.id,
        userId: post.authorId,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        description: post.title,
        photoUrls: mediaData.photoUrls || [],
      }
    })
  }
}