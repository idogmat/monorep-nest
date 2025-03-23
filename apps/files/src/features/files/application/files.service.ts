import { Injectable } from '@nestjs/common';
import { S3StorageAdapter } from '../../../common/s3/s3.storage.adapter';
import { FilesRepository } from '../infrastructure/files.repository';
import { InterlayerNotice } from '../../../../../gateway/src/common/error-handling/interlayer.notice';
import { UploadSummaryResponse } from '../../../common/types/upload.summary.response';
import { UploadResult } from '../../../common/types/upload.result';


@Injectable()
export class FilesService {
  constructor(
    private readonly s3StorageAdapter: S3StorageAdapter,
    private readonly filesRepository: FilesRepository) {
  }


  async sendPhoto(userId: string, postId: string, files: Express.Multer.File[]) : Promise<UploadSummaryResponse>{

    //TODO обработать память

    const uploadPromises = files.map(async (file) => {
      try {
        const result = await this.s3StorageAdapter.savePhoto(userId, postId, file);
        const fileDTO = {
          userId,
          postId,
          mimetype: file.mimetype,
          originalName: file.originalname,
          uploadData: result,
        };
        await this.filesRepository.createFile(fileDTO);

        return { fileName: file.originalname, status: "success", error: null} as UploadResult;
      } catch (error) {
        return { fileName: file.originalname, status: "error", error: error.message } as UploadResult;
      }
    });

    const results = await Promise.allSettled(uploadPromises);

    const successfulUploads = results
      .filter((res): res is PromiseFulfilledResult<UploadResult> => res.status === 'fulfilled' && res.value.status === 'success')
      .map(res => res.value);

    // const failedUploads = results
    //   .filter((res): res is PromiseFulfilledResult<UploadResult> => res.status === 'fulfilled' && res.value.status === 'error')
    //   .map(res => res.value);

    if (successfulUploads.length === files.length) {
      return {text: "All files uploaded successfully", files: [], error: false};
    }

    if (successfulUploads.length > 0) {
      return {text: "Some files uploaded successfully", files: [...successfulUploads], error: false };
    }

    return {text: "No files could be uploaded", files: [], error: true};
    // return InterlayerNotice.createErrorNotice( "No files could be uploaded", 'files', 422);
  }
}