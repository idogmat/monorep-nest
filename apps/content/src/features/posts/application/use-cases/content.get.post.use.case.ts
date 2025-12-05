import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsQueryPrismaRepository } from '../../infrastructure/prisma/posts.prisma.query-repository';
import { Prisma } from '../../../../../prisma/generated/content-client';
import { commentsMapping, likesMapping, urlsMapping } from '../../model/post.mapper';

export class ContentGetPostCommand {
  constructor(
    public postId: string,
  ) {
  }
}

@CommandHandler(ContentGetPostCommand)
export class ContentGetPostUseCase implements ICommandHandler<ContentGetPostCommand> {
  constructor(
    private postsQueryPrismaRepository: PostsQueryPrismaRepository
  ) {
  }

  async execute(command: ContentGetPostCommand): Promise<any> {
    console.log(command, 'command')
    const post = await this.postsQueryPrismaRepository.getPost(command.postId);
    console.log(post);
    return {
      ...post,
      urls: post?.urls?.map(urlsMapping) || [],
      comments: post?.comments?.map(commentsMapping) || [],
      likes: post?.likes?.map(likesMapping) || []
    };
  }
}