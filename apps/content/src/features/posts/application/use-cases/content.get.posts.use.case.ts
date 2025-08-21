import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsQueryPrismaRepository } from '../../infrastructure/prisma/posts.prisma.query-repository';
import { Prisma } from '../../../../../prisma/generated/content-client';

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
const urlsMapping = (urls) => {
  return {
    id: urls?.id,
    createdAt: urls?.createdAt,
    updatedAt: urls?.updatedAt,
    deletedAt: urls?.deletedAt,
    fileName: urls?.fileName,
    fileUrl: urls?.fileUrl,
    postId: urls?.postId
  }
}
type PostWithUrls = Prisma.PostGetPayload<{
  include: { urls: true }
}>;

const outputMapper = (post: PostWithUrls) => {
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
    urls: post?.urls?.map(urlsMapping) || []
  };
};

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