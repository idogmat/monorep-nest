import { Injectable } from "@nestjs/common";
import { createReadStream, unlinkSync } from "fs";
import { GateService } from "../../../common/gate.service";
import { InputProfileModel } from "../api/model/input.profile.model";
import { ProfileClientService } from "../../../support.modules/grpc/grpc.service";

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileClientService: ProfileClientService,
    readonly gateService: GateService,
  ) { }


  async updateProfile(
    file: Express.Multer.File,
    profile: InputProfileModel,
    userId: string
  ) {
    console.log(profile)
    const readStream = createReadStream(`./tmp/${file.filename}`);
    try {
      const result = await Promise.allSettled([
        await this.gateService.filesServicePost(
          'receive',
          readStream,
          {
            'Content-Type': file.mimetype,
            'X-Filename': file.originalname,
            'X-UserId': userId
          },
        ),
        await this.profileClientService.updateProfile({
          ...profile, userId
        })])
      console.log(result)
    } catch (error) {
      // Обработка ошибок
      console.error('Ошибка:', error.message);
      throw error;
    } finally {
      // 4. Удаляем временный файл
      unlinkSync(`./tmp/${file.filename}`);
    }
  }

  async subscribe(
    userId,
    subscribeUserId
  ) {
    try {
      const response = await this.gateService.profileServicePost(
        'subscribe',
        {
          userId,
          subscribeUserId
        },
        {},
      )
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