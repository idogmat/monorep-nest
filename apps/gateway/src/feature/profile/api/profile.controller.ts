import { ApiTags } from '@nestjs/swagger';
import { BadRequestException, Body, Controller, Get, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream, statSync, unlinkSync } from 'fs';
import { diskStorage } from 'multer';
import { ProfileService } from '../application/profile.service';
import { HttpService } from '@nestjs/axios';
import { mkdir } from 'fs/promises';
import { FileValidationPipe } from '../../../../../libs/check.file';
import { lastValueFrom } from 'rxjs';
import { AuthGuard } from '../../../common/guard/authGuard';
import { GateService } from '../../../common/gate.service';
import { InputProfileModel } from './model/input.profile.model';


@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  private readonly uploadsDir = './tmp/chunks';
  private readonly localFileName = 'test.png';
  constructor(
    readonly profileService: ProfileService,
    private readonly httpService: HttpService,
    readonly gateService: GateService,


  ) {
    mkdir(this.uploadsDir, { recursive: true });
  }

  @Get()
  async getProfiles(
    @Req() req: Request,
    // @Res() res: Response
  ) {
    const result = await this.gateService.profileServiceGet('', '')
    return result
    // return await this.profileService.
  }

  @Put('edit')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './tmp',
      filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
    }),
  }))
  async uploadFile(
    @Req() req,
    @Body() profile: InputProfileModel,
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException({
      message: 'Not a valid file'
    })
    await this.profileService.updateProfile(file, profile, req.user.userId)
  }


  @Post('localSave')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './tmp',
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    }),
  }))
  async uploadStream(@UploadedFile() file: Express.Multer.File) {
    await this.profileService.localSaveFile(file)
  }

  @Post('chunk')
  // @UseInterceptors(FileInterceptor('file'))
  async uploadFileChunk(


  ) {
    const filePath = `./tmp/${this.localFileName}`; // 📌 Путь к файлу
    const fileStats = statSync(filePath);
    const totalSize = fileStats.size;
    const chunkSize = 16 * 1024; // 16 KB
    const totalChunks = Math.ceil(totalSize / chunkSize);
    // const fileId = Date.now().toString(); // Уникальный идентификатор файла
    const fileId = '111111111';
    console.log(`🚀 Начинаем загрузку: ${filePath}`);
    console.log(`📦 Размер файла: ${totalSize} bytes, Чанков: ${totalChunks}`);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, totalSize);

      const fileStream = createReadStream(filePath, { start, end: end - 1 });

      try {
        await lastValueFrom(
          this.httpService.post('http://localhost:3795/receive-chunks', fileStream, {
            headers: {
              'Content-Type': 'application/octet-stream',
              'x-file-id': fileId,
              'x-chunk-index': chunkIndex,
              'x-total-chunks': totalChunks,
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
          }),
        );
        console.log(`✅ Чанк ${chunkIndex + 1}/${totalChunks} отправлен`);
      } catch (error) {
        console.error(`❌ Ошибка при отправке чанка ${chunkIndex + 1}:`, error.message);
        return;
      }
    }

    console.log('🔄 Все чанки загружены, отправляем команду на сборку файла...');
    await this.mergeFile(fileId, this.localFileName);
  }

  private async mergeFile(fileId: string, fileName: string) {
    try {
      await lastValueFrom(
        this.httpService.post('http://localhost:3795/receive-chunks-merge', { fileId, fileName }),
      );
      console.log('✅ Файл успешно собран на сервере!');
    } catch (error) {
      console.error('❌ Ошибка при сборке файла:', error.message);
    }
  }
}