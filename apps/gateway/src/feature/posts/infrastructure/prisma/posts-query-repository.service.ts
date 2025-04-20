import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Post, Prisma } from '../../../../../prisma/generated/client';
import { PostViewModel } from '../../api/model/output/post.view.model';
import { PaginationSearchPostTerm } from '../../../../../../libs/common/pagination/query.posts.model';


@Injectable()
export class PostsQueryRepository {
  constructor(private prisma: PrismaService) {
  }


  async getAllPosts(authUserId?: string, queryDto?: PaginationSearchPostTerm) {

    const { pageNumber, pageSize, sortBy, sortDirection, userId: queryUserId, description } = queryDto;

    const effectiveUserId = queryUserId || authUserId;

    const where: Prisma.PostWhereInput = {};

    if (effectiveUserId) {
      where.authorId = effectiveUserId;
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
      'authorId',
    ];

    const orderBy: Prisma.PostOrderByWithRelationInput = allowedSortFields.includes(sortBy as any)
      ? { [sortBy]: sortDirection.toLowerCase() as 'asc' | 'desc' }
      : { createdAt: 'desc' };

    const [items, totalCount] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy,
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.post.count({ where }),
    ]);

    return { items, totalCount, pageNumber, pageSize };

  }

  async getPostById(param: { id: string }) {
    const post = await this.prisma.post.findFirst({
      where: { id: param.id }
    })

    if (!post) {
      return null;
    }

    return this.mapPostToViewModel(post as Post);
  }

  mapPostToViewModel(post: Post): PostViewModel {
    return {
      id: post.id,
      userId: post.authorId,
      description: post.title,
      photoUploadStatus: post.photoUploadStatus,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }
  }
}