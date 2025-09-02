import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsQueryPrismaRepository } from '../../infrastructure/prisma/posts.prisma.query-repository';
import { Prisma } from '../../../../../prisma/generated/content-client';
import { outputMapper } from '../../model/post.mapper';

export class ContentGetPostsCommand {
  constructor(
    public sortBy?: string,
    public sortDirection?: string,
    public pageNumber?: number,
    public pageSize?: number,
    public userId?: string,
  ) {
  }
}



@CommandHandler(ContentGetPostsCommand)
export class ContentGetPostsUseCase implements ICommandHandler<ContentGetPostsCommand> {
  constructor(
    private postsQueryPrismaRepository: PostsQueryPrismaRepository
  ) {
  }

  async execute(command: ContentGetPostsCommand): Promise<any> {
    console.log(command, 'command')
    const newPosts = await this.postsQueryPrismaRepository.getAllPosts(command);
    console.log(newPosts);
    return { ...newPosts, items: newPosts.items.map(outputMapper) };
  }
}