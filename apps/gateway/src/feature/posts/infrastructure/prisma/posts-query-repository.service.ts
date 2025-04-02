import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Post } from '@prisma/client';

@Injectable()
export class PostsQueryRepository {
  constructor(private prisma: PrismaService) {
  }


  async getAllPosts(userId: string): Promise<Post[]>{
    const filter = !userId?{}: {userId};

    return this.prisma.post.findMany(filter);

  }

}