import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Post, Prisma } from '../../../../../prisma/generated/content-client';
import { ContentGetPostCommand } from '../../application/use-cases/content.get.post.use.case';


@Injectable()
export class PostsQueryPrismaRepository {
  constructor(private prisma: PrismaService) {
  }
  async getAllPosts(query: ContentGetPostCommand) {
    const { pageNumber, pageSize, sortBy, sortDirection, userId } = query;

    const where: Prisma.PostWhereInput = { userId };

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
      }),
      this.prisma.post.count({ where }),
    ]);
    console.log({ items, totalCount, pageNumber, pageSize });
    return { items, totalCount, pageNumber, pageSize };
  }
}