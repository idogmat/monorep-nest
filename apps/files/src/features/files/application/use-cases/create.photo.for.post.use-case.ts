import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FilesRepository } from '../../infrastructure/files.repository';
import { PostPhotoService } from '../post.photo.service';
import { promises as fs } from 'fs';
import * as AWS from 'aws-sdk';
import type { FailedUpload, SuccessfulUpload } from '../../../../common/types/upload.result';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';


export class CreatePhotoForPostCommand {
  constructor(
    public files: Express.Multer.File[],
    public userId: string,
    public postId: string,
  ) {
  }
}

@CommandHandler(CreatePhotoForPostCommand)
export class CreatePhotoForPostUseCase implements ICommandHandler<CreatePhotoForPostCommand> {

  constructor(private readonly filesRepository: FilesRepository,
    private readonly postPhotoService: PostPhotoService,
    @Inject('RABBITMQ_POST_SERVICE') private readonly rabbitClient: ClientProxy) { }

  async execute(command: CreatePhotoForPostCommand) {


    //Unpacking the necessary variables
    const { userId, postId, files } = command;
    //Define the folder
    const folder = `posts/user_${userId}/post_${postId}`;
    //Looping through the files.
    const uploadPromises = files.map(async (file) => {
      try {
        //Prepare the data for saving the file.
        const fileBuffer = await fs.readFile(file.path); // Читаем файл как буфер
        const fileInfo = {
          originalname: file.originalname,
          buffer: fileBuffer,
          mimetype: file.mimetype,
        };
        const uploadResult = await this.postPhotoService.uploadImage(fileInfo, folder);

        //create dto for create post media and save in mongo
        const postMedia = await this.createPostMedia(userId, postId, uploadResult, file.mimetype, file.originalname);

        return { status: 'success' as const, file: file.originalname, url: uploadResult.Location };
      } catch (error) {
        return { status: 'error' as const, file: file.originalname, error: error.message };
      } finally {
        try {
          await fs.unlink(file.path);
        } catch (err) {
          console.warn(`Не удалось удалить файл ${file.path}:`, err.message);
        }
      }
    });

    // Выполняем все загрузки
    const results: PromiseSettledResult<SuccessfulUpload | FailedUpload>[] = await Promise.allSettled(uploadPromises);

    console.log("results", results);
    const successfulUploads = results
      .filter((res): res is PromiseFulfilledResult<SuccessfulUpload> => res.status === 'fulfilled' && res.value.status === 'success')
      .map(res => res.value);
    if (successfulUploads.length > 0) {
      // Отправляем сообщение в RabbitMQ
      const message = {
        userId,
        postId,
        files: successfulUploads.map(file => ({
          fileName: file.file,
          fileUrl: file.url,
        })),
        timestamp: new Date(),
      };

      try {
        this.rabbitClient.emit('files_uploaded', message);
      } catch (e) {
        console.error("Send to files_uploaded files -> posts", e)
      }

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