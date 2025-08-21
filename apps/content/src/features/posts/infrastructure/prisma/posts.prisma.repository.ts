import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { $Enums, Comment, File, Post } from '../../../../../prisma/generated/content-client';
import PhotoUploadStatus = $Enums.PhotoUploadStatus;
import { UploadPhotoCommand } from '../../application/use-cases/content.upload.photo';
import { UploadedFileResponse } from '../../../../../../files/src/features/files/application/s3.service';


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

  async createComment(userId: string, postId: string, message: string): Promise<any> {
    // const [res, comment] = await this.prisma.$transaction([
    const res = await this.prisma.post.findFirst({
      where: { id: postId },
    })

    if (!res?.id) throw new Error('Post not found');
    const comment = await this.prisma.comment.create({
      data: {
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        message,
        postId,
      },
    })
    // ]);
    console.log(res, ' resComment')
    console.log(comment, ' comment')
  }

  async updateStatusForPost(postId: string, status: PhotoUploadStatus): Promise<Post> {
    return this.prisma.post.update({
      where: { id: postId },
      data: { photoUploadStatus: status },
    });
  }

  async uploadPhotos(userId: string, postId: string, data: UploadedFileResponse[]): Promise<any> {
    const postExists = await this.prisma.post.findUnique({
      where: { id: postId }
    });

    if (!postExists) {
      throw new Error(`Post with ID ${postId} does not exist`);
    }

    const result = await Promise.all(
      data.map(e => this.prisma.file.create({
        data: {
          fileName: e.originalName,
          fileUrl: e.location,
          postId: postId
        }
      })),
    );
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        photoUploadStatus: PhotoUploadStatus.COMPLETED
      }
    });
    return result;
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
}