import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { $Enums, File, Post } from '../../../../../prisma/generated/content-client';
import PhotoUploadStatus = $Enums.PhotoUploadStatus;
import { UploadPhotoCommand } from '../../application/use-cases/content.upload.photo';
import { UploadedFileResponse } from 'apps/files/src/features/files/application/s3.service';


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

  async uploadPhotos(userId: string, postId: string, data: UploadedFileResponse[]): Promise<any> {
    const postExists = await this.prisma.post.findUnique({
      where: { id: postId }
    });

    if (!postExists) {
      throw new Error(`Post with ID ${postId} does not exist`);
    }

    // Используем Promise.all для параллельного выполнения
    const result = await Promise.all(
      data.map(e => this.prisma.file.create({
        data: {
          fileName: e.originalName,
          fileUrl: e.location,
          postId: postId // убедитесь, что используется правильное значение
        }
      }))
    );

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