import { unlinkSync } from 'fs';
import * as fs from 'fs';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import FormData from 'form-data';
import { InterlayerNotice } from '../../../../../../libs/common/error-handling/interlayer.notice';
import { FileError } from '../../../../../../gateway/src/common/error-handling/file.error';
import { ENTITY_POST } from '../../../../../../libs/common/entities.constants';
import { GateService } from '../../../../../../gateway/src/common/gate.service';


export class UploadPostPhotosCommand {
  constructor(
    public readonly files: Express.Multer.File[],
    public readonly userId: string,
    public readonly postId: string
  ) {}
}

@CommandHandler(UploadPostPhotosCommand)
export class UploadPostPhotosUseCase implements ICommandHandler<UploadPostPhotosCommand> {
  constructor(
    private gateService: GateService,
  ) {
  }
  async execute(command: UploadPostPhotosCommand): Promise<InterlayerNotice> {
    const { files, userId, postId } = command;

    if (!files || files.length === 0) {
      return InterlayerNotice.createErrorNotice(
        FileError.NO_FILES_UPLOAD,
        ENTITY_POST,
        400
      )
    }

    const formData = new FormData();
    files.forEach((file) => {
      if (!file.path) {
        console.error('File path is missing:', file);
        return InterlayerNotice.createErrorNotice(
          FileError.INVALID_FORMAT_FILES,
          ENTITY_POST,
          400
        );
      }
      formData.append('files', fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });

    const headers = formData.getHeaders();
    headers['Content-Type'] = 'multipart/form-data';
    headers['X-UserId'] = userId;
    headers['X-PostId'] = postId;

    try {
      const response = await this.gateService.filesServicePost('upload_files',
        formData, headers)
      console.log("response file ---------", response.data);
      return new InterlayerNotice<null>;
    } catch (error) {
      console.error('Error during file upload:', error);
      return InterlayerNotice.createErrorNotice(
        FileError.INVALID_FORMAT_FILES,
        ENTITY_POST,
        400
      );
    } finally {
      for (const file of files) {
        try {
          await unlinkSync(file.path);
          console.log(`File ${file.originalname} deleted successfully`);
        } catch (error) {
          console.error(`Error deleting file ${file.originalname}:`, error);
        }
      }
    }
  }
}