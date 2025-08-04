import { Post } from '../../../../../prisma/generated/content-client';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsQueryPrismaRepository } from '../../infrastructure/prisma/posts.prisma.query-repository';

export class ContentGetPostCommand {
  constructor(
    public sortBy?: string,
    public sortDirection?: string,
    public pageNumber?: number,
    public pageSize?: number,
    public userId?: string,
  ) {
  }
}
const outputMapper = (post: Post) => {
  return {
    id: post.id,
    userId: post.userId,
    createdAt: post.createdAt?.toString(),
    updatedAt: post.updatedAt?.toString(),
    deletedAt: post.deletedAt?.toString(),
    title: post.title,
    published: post.published,
    banned: post.banned,
    photoUploadStatus: post.photoUploadStatus,
  };
};

@CommandHandler(ContentGetPostCommand)
export class ContentGetPostUseCase implements ICommandHandler<ContentGetPostCommand> {
  constructor(
    private postsQueryPrismaRepository: PostsQueryPrismaRepository
  ) {
  }

  async execute(command: ContentGetPostCommand): Promise<any> {
    console.log(command, 'command')
    const newPosts = await this.postsQueryPrismaRepository.getAllPosts(command);
    console.log(newPosts);
    return { ...newPosts, items: newPosts.items.map(outputMapper) };
  }
}