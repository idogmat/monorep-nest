import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { BadRequestException, Body, Controller, ForbiddenException, Get, Param, Patch, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ProfileService } from '../application/profile.service';
import { HttpService } from '@nestjs/axios';
import { mkdir } from 'fs/promises';
import { AuthGuard } from '../../../common/guard/authGuard';
import { GateService } from '../../../common/gate.service';
import { InputProfileModel } from './model/input.profile.model';
import { FileValidationPipe } from '../../../../../libs/input.validate/check.file';
import { EnhancedParseUUIDPipe } from '../../../../../libs/input.validate/check.uuid-param';
import { Request } from 'express';
import { AuthGuardOptional } from '../../../common/guard/authGuardOptional';


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


  @Get(':id')
  @UseGuards(AuthGuardOptional)
  async getProfile(
    @Req() req: Request,
    @Param('id', new EnhancedParseUUIDPipe()) id: string
    // @Res() res: Response
  ) {
    const headers = { 'X-UserId': '' }
    if (req.user) headers['X-UserId'] = req.user.userId
    const result = await this.gateService.profileServiceGet(id, headers)
    return result
    // return await this.profileService.
  }

  @Get()
  async getProfiles(
    @Req() req: Request,
    @Query() query: any
    // @Res() res: Response
  ) {
    const headers = { 'X-UserId': '' }
    if (req.user) headers['X-UserId'] = req.user.userId
    const result = await this.gateService.profileServiceGet('', headers)
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
    console.log(file, 'file')
    if (!file) throw new BadRequestException({
      message: 'Not a valid file'
    })
    await this.profileService.updateProfile(file, profile, req.user.userId)
  }

  @Patch('subscribe/:id')
  @UseGuards(AuthGuard)
  async subscribe(
    @Req() req,
    @Param('id') id: string
  ) {
    if (req.user.userId === id) throw new ForbiddenException()
    try {
      await this.profileService.subscribe(req.user.userId, id)
    } catch {
      throw new BadRequestException({
        message: 'Not a valid userId'
      })
    }

  }


  // @Post('localSave')
  // @UseInterceptors(FileInterceptor('file', {
  //   storage: diskStorage({
  //     destination: './tmp',
  //     filename: (req, file, cb) => {
  //       cb(null, `${Date.now()}-${file.originalname}`);
  //     },
  //   }),
  // }))
  // async uploadStream(@UploadedFile() file: Express.Multer.File) {
  //   await this.profileService.localSaveFile(file)
  // }

  // @Post('chunk')
  // // @UseInterceptors(FileInterceptor('file'))
  // async uploadFileChunk(


  // ) {
  //   const filePath = `./tmp/${this.localFileName}`; // 📌 Путь к файлу
  //   const fileStats = statSync(filePath);
  //   const totalSize = fileStats.size;
  //   const chunkSize = 16 * 1024; // 16 KB
  //   const totalChunks = Math.ceil(totalSize / chunkSize);
  //   // const fileId = Date.now().toString(); // Уникальный идентификатор файла
  //   const fileId = '111111111';
  //   console.log(`🚀 Начинаем загрузку: ${filePath}`);
  //   console.log(`📦 Размер файла: ${totalSize} bytes, Чанков: ${totalChunks}`);

  //   for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
  //     const start = chunkIndex * chunkSize;
  //     const end = Math.min(start + chunkSize, totalSize);

  //     const fileStream = createReadStream(filePath, { start, end: end - 1 });

  //     try {
  //       await lastValueFrom(
  //         this.httpService.post('http://localhost:3795/receive-chunks', fileStream, {
  //           headers: {
  //             'Content-Type': 'application/octet-stream',
  //             'x-file-id': fileId,
  //             'x-chunk-index': chunkIndex,
  //             'x-total-chunks': totalChunks,
  //           },
  //           maxBodyLength: Infinity,
  //           maxContentLength: Infinity,
  //         }),
  //       );
  //       console.log(`✅ Чанк ${chunkIndex + 1}/${totalChunks} отправлен`);
  //     } catch (error) {
  //       console.error(`❌ Ошибка при отправке чанка ${chunkIndex + 1}:`, error.message);
  //       return;
  //     }
  //   }

  //   console.log('🔄 Все чанки загружены, отправляем команду на сборку файла...');
  //   await this.mergeFile(fileId, this.localFileName);
  // }

  // private async mergeFile(fileId: string, fileName: string) {
  //   try {
  //     await lastValueFrom(
  //       this.httpService.post('http://localhost:3795/receive-chunks-merge', { fileId, fileName }),
  //     );
  //     console.log('✅ Файл успешно собран на сервере!');
  //   } catch (error) {
  //     console.error('❌ Ошибка при сборке файла:', error.message);
  //   }
  // }
}