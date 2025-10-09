import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '../../../../../prisma/generated/content-client';
import { ContentGetPostsCommand } from '../../application/use-cases/content.get.posts.use.case';


@Injectable()
export class PostsQueryPrismaRepository {
  constructor(private prisma: PrismaService) {
  }
  async getAllPosts(query: ContentGetPostsCommand) {
    const { pageNumber, pageSize, sortBy, sortDirection, userId } = query;
    const where: Prisma.PostWhereInput = {};
    if (userId) where.userId = userId;
    const allowedSortFields: (keyof Prisma.PostOrderByWithRelationInput)[] = [
      'createdAt',
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
        include: {
          urls: true,
          comments: true,
          likes: true
        }
      }),
      this.prisma.post.count({ where }),
    ]);
    console.log({ items, totalCount, pageNumber, pageSize });
    return { items, totalCount, pageNumber, pageSize };
  }

  async getPost(id: string) {
    const item = await
      this.prisma.post.findFirst({
        where: { id },
        include: {
          urls: true,
          comments: true,
          likes: true
        }
      })

    return item;
  }
}