import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FilesRepository } from '../../infrastructure/files.repository';
import { PostPhotoService } from '../post.photo.service';
import { promises as fs } from 'fs';
import * as AWS from 'aws-sdk';
import type { FailedUpload, SuccessfulUpload } from '../../../../common/types/upload.result';


export class CreatePhotoForPostCommand{
  constructor(
    public files: Express.Multer.File[],
    public userId: string,
    public postId: string,
  ) {
  }
}

@CommandHandler(CreatePhotoForPostCommand)
export class CreatePhotoForPostUseCase implements ICommandHandler<CreatePhotoForPostCommand>{

  constructor(private readonly filesRepository: FilesRepository,
              private readonly postPhotoService: PostPhotoService, ) { }

  async execute(command: CreatePhotoForPostCommand){

    //Unpacking the necessary variables
    const {userId, postId, files} = command;
    //Define the folder
    const folder = `posts/user_${userId}/post_${postId}`;
    //Looping through the files.
    const uploadPromises: Promise<SuccessfulUpload | FailedUpload>[] = files.map( async (file) =>{
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
        await this.createPostMedia(userId, postId, uploadResult, file.mimetype, file.originalname);

        return { status: 'success' as const, file: file.originalname, url: uploadResult.Location };
      }catch (error){
          return { status: 'error' as const, file: file.originalname, error: error.message };
      }finally {
          try {
            await fs.unlink(file.path);
          } catch (err) {
            console.warn(`Не удалось удалить файл ${file.path}:`, err.message);
          }
        }
    });

    // Выполняем все загрузки
    const results: PromiseSettledResult<SuccessfulUpload | FailedUpload>[] = await Promise.allSettled(uploadPromises);


    // Разбираем результаты
    const successfulUploads: SuccessfulUpload[] = results
      .filter((res): res is PromiseFulfilledResult<SuccessfulUpload> =>
        res.status === 'fulfilled' && (res.value as any).status === 'success'
      )
      .map(res => res.value as SuccessfulUpload);

    const failedUploads: FailedUpload[] = results
      .filter((res): res is PromiseFulfilledResult<FailedUpload> =>
        res.status === 'fulfilled' && (res.value as any).status === 'error'
      )
      .map(res => res.value as FailedUpload);

    // Возвращаем ответ в `gateway`
    // return {
    //   postId,
    //   successfulUploads,
    //   errorFiles: failedUploads,
    //   message:
    //     successfulUploads.length === files.length
    //       ? 'All files uploaded successfully'
    //       : successfulUploads.length > 0
    //         ? 'Some files uploaded successfully'
    //         : 'No files could be uploaded',
    //   error: successfulUploads.length === 0,
    // };
  }

  async createPostMedia(userId: string, postId: string, uploadResult: AWS.S3.ManagedUpload.SendData,
                        mimetype: string, originalName: string){
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