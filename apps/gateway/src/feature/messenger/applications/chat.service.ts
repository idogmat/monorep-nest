import { Inject, Injectable } from "@nestjs/common";
import { ProfileClientService } from "../../../support.modules/grpc/grpc.profile.service";
import { UpdateUserProfileRequest } from 'aws-sdk/clients/opsworks';
import { SendFileService } from "../../../../../gateway/src/support.modules/file/file.service";
import { fileExist } from "../../../../../libs/common/helpers/exist.file";
import { unlink } from "fs/promises";

@Injectable()
export class ChatService {
  constructor(
    @Inject('SEND_FILE_SERVICE') private readonly sendFileService: SendFileService,
  ) { }


  async uploadFileForChat(
    file: Express.Multer.File,
    senderId: string,
    userId: string
  ) {
    // 1. Сохраняем актуальный путь к файлу
    const filePath = file.path;
    console.log('Processing file: chat ebt', filePath);

    try {
      // 2. Проверяем существование файла перед обработкой
      const fileCheck = await fileExist(filePath);
      if (!fileCheck) {
        throw new Error(`File not found: ${filePath}`);
      }

      // 3. Выполняем операции

      const result = await this.sendFileService.uploadFileForChatGrpc(file, senderId, userId);
      console.log(result)

      // 4. Проверяем результаты
      // const errors = results.filter(r => r.status === 'rejected');
      // if (errors.length > 0) {
      //   throw new AggregateError(errors.map(e => (e as PromiseRejectedResult).reason));
      // }

      return { success: true, message: 'Profile updated successfully' };

    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: 'Profile update failed',
        error: error.message
      };
    } finally {
      try {
        // 5. Удаляем только если файл существует
        if (await fileExist(filePath)) {
          await unlink(filePath);
          console.log(`Temporary file deleted: ${filePath}`);
        } else {
          console.warn(`File already deleted: ${filePath}`);
        }
      } catch (deleteError) {
        console.error('File deletion error:', deleteError);
      }
    }
  }
}