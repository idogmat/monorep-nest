import { Injectable } from '@nestjs/common';
import { PostViewModel } from '../../api/model/output/post.view.model';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, File } from '../../../../../prisma/generated/post-client';
import { PaginationSearchPostTerm } from '../../../../../../libs/common/pagination/query.posts.model';
import { PaginationSearchPostGqlTerm } from '../../../../../../gateway/src/feature/superAdmin/api/utils/pagination';

type PostWithUrls = Prisma.PostGetPayload<{
  include: { urls: true };
}>;

@Injectable()
export class PostsQueryRepository {
  constructor(private prisma: PrismaService) {
  }


  async getAllPosts(queryDto?: PaginationSearchPostTerm) {

    const { pageNumber, pageSize, sortBy, sortDirection, userId: queryUserId, description } = queryDto;

    const effectiveUserId = queryUserId;

    const where: Prisma.PostWhereInput = {};

    if (effectiveUserId) {
      where.userId = effectiveUserId;
    }

    if (description) {
      where.title = {
        contains: description,
        mode: 'insensitive',
      };
    }

    const allowedSortFields: (keyof Prisma.PostOrderByWithRelationInput)[] = [
      'createdAt',
      'title',
      'userId',
    ];

    const orderBy: Prisma.PostOrderByWithRelationInput = allowedSortFields.includes(sortBy as any)
      ? { [sortBy]: sortDirection.toLowerCase() as 'asc' | 'desc' }
      : { createdAt: 'desc' };

    const [items, totalCount] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy,
        skip: (pageNumber - 1) * pageSize,
        take: +pageSize,
        include: { urls: true },
      }),
      this.prisma.post.count({ where }),
    ]);

    const mappedItems = items.map(post => this.mapPostToViewModel(post as PostWithUrls));
    return { mappedItems, totalCount, pageNumber, pageSize };

  }

  async getAllPostsGQL(queryDto?: PaginationSearchPostGqlTerm) {

    const { offset, limit, sortBy, sortDirection, userId, description } = queryDto;

    const effectiveUserId = userId;

    const where: Prisma.PostWhereInput = {};

    if (effectiveUserId) {
      where.userId = effectiveUserId;
    }

    if (description) {
      where.title = {
        contains: description,
        mode: 'insensitive',
      };
    }

    const allowedSortFields: (keyof Prisma.PostOrderByWithRelationInput)[] = [
      'createdAt',
      'title',
      'userId',
    ];

    const orderBy: Prisma.PostOrderByWithRelationInput = allowedSortFields.includes(sortBy as any)
      ? { [sortBy]: sortDirection.toLowerCase() as 'asc' | 'desc' }
      : { createdAt: 'desc' };

    const [items, totalCount] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy,
        skip: +offset,
        take: +limit,
        include: { urls: true },
      }),
      this.prisma.post.count({ where }),
    ]);

    const mappedItems = items.map(post => this.mapPostToViewModel(post as PostWithUrls));
    return { posts: mappedItems, totalCount: totalCount };

  }

  async getPostById( id: string) {
    const post = await this.prisma.post.findFirst({
      where: { id },
      include: { urls: true },
    }) as PostWithUrls;

    if (!post) {
      return null;
    }

    return this.mapPostToViewModel(post);

  }

  mapPostToViewModel(
    post: PostWithUrls
  ): PostViewModel {
    return {
      id: post.id,
      userId: post.userId,
      description: post.title,
      photoUploadStatus: post.photoUploadStatus,
      photoUrls: (post.urls as File[]).map(file => file.fileUrl),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }
}