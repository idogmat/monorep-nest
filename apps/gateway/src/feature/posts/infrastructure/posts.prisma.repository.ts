import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Post } from '@prisma/client';

@Injectable()
export class  PostsPrismaRepository{
  constructor(private prisma: PrismaService) {
  }

  async createPost(userId:string, postId: string ,title: string): Promise<Post>{
    return this.prisma.post.create({
      data: {
        id: postId,
        authorId: userId,
        title: title
      }
    })
  }
}