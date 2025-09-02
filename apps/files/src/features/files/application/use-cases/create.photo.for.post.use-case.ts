import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FilesRepository } from '../../infrastructure/files.repository';
import { S3UploadPhotoService } from '../post.photo.service';
import { existsSync, promises as fs, mkdirSync, readdirSync, readFileSync, statSync } from 'fs';
import * as AWS from 'aws-sdk';
import { Inject } from '@nestjs/common';
import { basename, join } from 'path';
import { RabbitService } from '../rabbit.service';


export class CreatePhotoForPostCommand {
  constructor(
    public userId: string,
    public postId: string,
  ) {
  }
}

@CommandHandler(CreatePhotoForPostCommand)
export class CreatePhotoForPostUseCase implements ICommandHandler<CreatePhotoForPostCommand> {

  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly postPhotoService: S3UploadPhotoService,
    @Inject('RABBIT_SERVICE') private readonly rabbitClient: RabbitService
  ) { }
  async execute(command: CreatePhotoForPostCommand) {
    const { userId, postId } = command
    const folder = join(__dirname, 'uploads', userId, 'posts', postId);
    if (!existsSync(folder)) mkdirSync(folder, { recursive: true });
    const files = readdirSync(folder)
      .filter(file => statSync(join(folder, file)).isFile()); // исключаем подпапки
    console.log(files);
    try {
      const result = await Promise.all(files.map(filename => {
        const filePath = join(folder, filename);
        const buffer = readFileSync(filePath);
        const fileInfo = {
          originalname: basename(filePath),
          buffer,
          mimetype: 'application/octet-stream',
        };
        const s3Path = `posts/user_${userId}/post_${postId}`;

        return this.postPhotoService.uploadImage(fileInfo, s3Path);
      }));
      await Promise.all(files.map(filename => {
        const filePath = join(folder, filename);
        return fs.unlink(filePath); // Use fs.unlink() from fs.promises
      }));
      console.log(result)
      // result.map(e => {
      //   this.createPostMedia(userId, postId, e,)

      // })
      const rabbit = await this.rabbitClient.publishToQueue('posts_queue', {
        type: 'UPLOAD_POSTS_PHOTO',
        userId,
        postId,
        data: result,
        createdAt: new Date(),
      });
      console.log(rabbit)
    } catch (error) {
      console.error('Error during file upload or deletion:', error);
      // You might want to handle this error, for example, by rolling back the S3 upload.
      throw error; // Re-throw the error to propagate it.
    }
  }

  async createPostMedia(userId: string, postId: string, uploadResult: AWS.S3.ManagedUpload.SendData,
    mimetype: string, originalName: string) {
    const postMediaDTO = {
      userId,
      postId,
      mimetype: mimetype,
      originalName: originalName,
      uploadData: {
        key: uploadResult.Key,
        Location: uploadResult.Location,
        ETag: uploadResult.ETag,
        Bucket: uploadResult.Bucket,
      },
    }

    await this.filesRepository.createPostMedia(postMediaDTO);
  }
}