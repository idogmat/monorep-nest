import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { $Enums, Post } from '../../../../../prisma/generated/content-client';
import PhotoUploadStatus = $Enums.PhotoUploadStatus;


@Injectable()
export class PostsPrismaRepository {
  constructor(private prisma: PrismaService) {
  }

  async createPost(userId: string, title: string, status: PhotoUploadStatus): Promise<Post> {
    return this.prisma.post.create({
      data: {
        userId,
        title,
        photoUploadStatus: PhotoUploadStatus[status],
      },
    });
  }

  async updateStatusForPost(postId: string, status: PhotoUploadStatus): Promise<Post> {
    return this.prisma.post.update({
      where: { id: postId },
      data: { photoUploadStatus: status },
    });
  }

  async findByUserId(userId: string): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: { userId: userId },
    });
  }

  async findById(id: string): Promise<Post | null> {
    return this.prisma.post.findFirst({
      where: { id },
    });
  }

  async updatePost(param: { id: string, data: Partial<Post> }) {
    return this.prisma.post.update({
      where: { id: param.id },
      data: param.data,
    });
  }

  async delete(param: { id: string }) {
    await this.prisma.post.delete({
      where: { id: param.id },
    });
  }

  async markAsBanned(userId: string) {
    try {
      await this.prisma.post.updateMany({
        where: { userId },
        data: { banned: true }
      });
    } catch (error) {

    }
  }

  async deletePostWithFiles(param: { id: string }) {
    await this.prisma.$transaction([
      this.prisma.file.deleteMany({
        where: { postId: param.id },
      }),
      this.prisma.post.delete({
        where: { id: param.id },
      }),
    ]);
  }
  // async createUrlForPost(postId: string, files: FileMetadata[]) {
  //   const data = files.map((file) => ({
  //     postId,
  //     fileName: file.fileName,
  //     fileUrl: file.fileUrl,
  //   }));
  //
  //
  //   await this.prisma.file.createMany({
  //     data,
  //   });

  // }
}