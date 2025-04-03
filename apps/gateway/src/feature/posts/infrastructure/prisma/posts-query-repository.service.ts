import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Post } from '@prisma/client';
import { PostViewModel } from '../../api/model/output/post.view.model';

@Injectable()
export class PostsQueryRepository {
  constructor(private prisma: PrismaService) {
  }


  async getAllPosts(userId?: string): Promise<Post[]>{

    return this.prisma.post.findMany({
      where: userId ? { authorId: userId } : undefined,
    });
  }

  async getPostById(param: { id: string }) {
    const post = await this.prisma.post.findFirst({
      where: {id: param.id}
    })

    if (!post) {
      return null;
    }

    return this.mapPostToViewModel(post as Post);
  }

  mapPostToViewModel(post: Post): PostViewModel{
    return {
      id: post.id,
      userId: post.authorId,
      description: post.title,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }
  }
}