import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FilesRepository } from '../../infrastructure/files.repository';
import { FilesQueryRepository } from '../../infrastructure/files.query-repository';
import { Inject } from '@nestjs/common';
import { S3StorageAdapter } from '../s3.service';

export class DeletePhotoMediaCommand {
  constructor(
    public userId: string,
    public postId: string,
  ) {
  }
}

@CommandHandler(DeletePhotoMediaCommand)
export class DeletePhotoMediaUseCase implements ICommandHandler<DeletePhotoMediaCommand> {

  constructor(
    @Inject('POST_PHOTO_BUCKET_ADAPTER') private s3Adapter: S3StorageAdapter,
  ) {
  }

  async execute(command: DeletePhotoMediaCommand) {
    const { userId, postId } = command
    const s3Path = `posts/user_${userId}/post_${postId}`
    try {
      const files = await this.s3Adapter.getFilesByPath(s3Path)
      if (files.length) {
        const result = await Promise.allSettled([
          files.forEach(f => this.s3Adapter.deleteFile(f.Key))
        ])
        console.log(result)
      }
    } catch (err) {
      console.warn(`Не удалось удалить файл по пути ${s3Path}:`, err.message);
    }
  }
}