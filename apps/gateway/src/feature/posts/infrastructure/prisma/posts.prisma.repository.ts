import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PhotoUploadStatus, Post } from '@prisma/client';

@Injectable()
export class  PostsPrismaRepository{
  constructor(private prisma: PrismaService) {
  }

  async createPost(userId:string, title: string, status: PhotoUploadStatus): Promise<Post>{
    return this.prisma.post.create({
      data: {
        authorId: userId,
        title,
        photoUploadStatus: status
      }
    })
  }

  async updateStatusForPost(postId: string, status: PhotoUploadStatus): Promise<Post>{
    return this.prisma.post.update({
      where: {id: postId},
      data: {photoUploadStatus: status}
    })
  }

  async findById(id: string): Promise<Post|null>{
    return this.prisma.post.findFirst({
      where: {id}
    })
  }

  async updatePost(param: { id: string, data: Partial<Post> }) {
    return this.prisma.post.update({
      where: {id: param.id},
      data: param.data
    })
  }

  async delete(param: { id: string }) {
    await this.prisma.post.delete({
      where: {id: param.id}
    })
  }
}