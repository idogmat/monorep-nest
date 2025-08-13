import { Inject, Injectable } from "@nestjs/common";
import { GateService } from "../../../common/gate.service";
import { InputProfileModel } from "../api/model/input/input.profile.model";
import { ProfileClientService } from "../../../support.modules/grpc/grpc.profile.service";
import { UpdateUserProfileRequest } from 'aws-sdk/clients/opsworks';
import { SendFileService } from "apps/gateway/src/support.modules/file/file.service";
import { fileExist } from "apps/libs/common/helpers/exist.file";
import { unlink } from "fs/promises";

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileClientService: ProfileClientService,
    @Inject('SEND_FILE_SERVICE') private readonly sendFileService: SendFileService,
    readonly gateService: GateService,
  ) { }


  async updateProfile(
    file: Express.Multer.File,
    profile: InputProfileModel,
    userId: string
  ) {
    // 1. Сохраняем актуальный путь к файлу
    const filePath = file.path;
    console.log('Processing file:', filePath);

    try {
      // 2. Проверяем существование файла перед обработкой
      const fileCheck = await fileExist(filePath);
      if (!fileCheck) {
        throw new Error(`File not found: ${filePath}`);
      }

      // 3. Выполняем операции
      const results = await Promise.allSettled([
        this.sendFileService.uploadFileGrpc(file, userId),
        this.profileClientService.updateProfile({ ...profile, userId })
      ]);

      // 4. Проверяем результаты
      const errors = results.filter(r => r.status === 'rejected');
      if (errors.length > 0) {
        throw new AggregateError(errors.map(e => (e as PromiseRejectedResult).reason));
      }

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


  async updateProfileData(
    profile: Omit<Partial<UpdateUserProfileRequest>, 'userId'>,
    userId: string
  ) {

    type ProfileUpdateData = Partial<UpdateUserProfileRequest> & {
      userId: string; // Делаем userId обязательным
    };

    const requestData: ProfileUpdateData = {
      ...profile,
      userId
    };

    const result = await this.profileClientService.updateProfileData(requestData);

    return result;

  }
  async subscribe(
    userId,
    subscribeUserId
  ) {
    try {
      console.log(userId,
        subscribeUserId)
      const response = await this.profileClientService.subscribeProfile(userId, subscribeUserId)
      console.log(response, 'response')
      return response
    } catch (error) {
      console.error('Ошибка:', error.message);
      throw error;
    }
  }

  async subscribeProfile(
    userId: string,
    paymentAccount: boolean
  ) {
    try {
      const response = await this.profileClientService.updateUserProfileSubscribe(userId, paymentAccount)
      return response
    } catch (error) {
      console.error('Ошибка:', error.message);
      throw error;
    }
  }

  // async chunkSlicer(file) {
  //   const fileStream = Readable.from(file.buffer); // Создаем поток из буфера
  //   let chunkIndex = 0;

  //   for await (const chunk of fileStream) {
  //     this.client.emit('file_upload', {
  //       filename: file.originalname,
  //       chunkIndex,
  //       data: chunk.toString('base64'), // Кодируем в Base64 (RabbitMQ не передает Binary)
  //     });

  //     chunkIndex++;
  //   }

  //   this.client.emit('file_upload_complete', { filename: file.originalname });

  //   return { message: 'File is being streamed to processing', filename: file.originalname };
  // }

  // async localSaveFile(file) {
  //   const readStream = createReadStream(file.path);

  //   // 2. Создаем поток ЗАПИСИ в целевую директорию
  //   const writeStream = createWriteStream(`./uploads/${file.originalname}`);

  //   // 3. Передаем данные через потоки
  //   readStream.pipe(writeStream);

  //   return new Promise((resolve, reject) => {
  //     // 4. Удаляем временный файл после успешной записи
  //     writeStream.on('finish', () => {
  //       unlinkSync(file.path); // Удаляем временный файл
  //       resolve({ status: 'ok' });
  //     });

  //     // 5. Обрабатываем ошибки
  //     writeStream.on('error', (error) => {
  //       unlinkSync(file.path); // Удаляем временный файл даже при ошибке
  //       reject(error);
  //     });
  //   });
  // }
}