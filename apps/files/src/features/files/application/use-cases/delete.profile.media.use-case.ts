import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { S3StorageAdapter } from '../s3.service';

export class DeleteProfileMediaCommand {
  constructor(
    public userId: string,
  ) {
  }
}

@CommandHandler(DeleteProfileMediaCommand)
export class DeleteProfileMediaUseCase implements ICommandHandler<DeleteProfileMediaCommand> {

  constructor(
    @Inject('PROFILE_BUCKET_ADAPTER') private s3Adapter: S3StorageAdapter,
  ) {
  }

  async execute(command: DeleteProfileMediaCommand) {
    const { userId } = command
    const s3Path = `profile/user_${userId}`;
    try {
      const files = await this.s3Adapter.getFilesByPath(s3Path)
      console.log(files)

      if (files.length) {
        const result = await Promise.allSettled([
          files.map(f => this.s3Adapter.deleteFile(f.Key))
        ])
        console.log(result)
      }
    } catch (err) {
      console.warn(`Не удалось удалить файл по пути ${s3Path}:`, err.message);
    }
  }
}