import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FilesRepository } from '../../infrastructure/files.repository';
import { FilesQueryRepository } from '../../infrastructure/files.query-repository';
import { Inject } from '@nestjs/common';
import { S3StorageAdapterJ } from '../s3.service';

export class DeletePhotoMediaCommand{
  constructor(
    public postId: string,
  ) {
  }
}

@CommandHandler(DeletePhotoMediaCommand)
export class DeletePhotoMediaUseCase implements ICommandHandler<DeletePhotoMediaCommand>{

  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly filesQueryRepository: FilesQueryRepository,
    @Inject('POST_PHOTO_BUCKET_ADAPTER') private s3Adapter: S3StorageAdapterJ,
    ) {
  }

  async execute(command: DeletePhotoMediaCommand){

    try {
      const photoMedia = await this.filesQueryRepository.getPhotoMediaByPostId(command.postId);
      for (const photo of photoMedia) {
        try {
          await this.s3Adapter.deleteFile(photo.key);
        }catch (err) {
          console.warn(`Не удалось удалить файл с ключом ${photo.key}:`, err.message);
        }
      }
      await this.filesRepository.deletePostMedia(command.postId);
    } catch (error) {
      console.error('Ошибка при удалении медиа поста:', error.message);
      throw error;
    }


    
    
  }
}