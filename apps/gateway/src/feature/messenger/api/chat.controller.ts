import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdir } from 'fs/promises';
import { AuthGuard } from '../../../common/guard/authGuard';
import { EnhancedParseUUIDPipe } from '../../../../../libs/input.validate/check.uuid-param';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ChatService } from '../applications/chat.service';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  private readonly uploadsDir = './tmp/chunks';
  constructor(
    readonly chatService: ChatService
  ) {
    mkdir(this.uploadsDir, { recursive: true });
  }

  @Post(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  // @ApiFileWithDto(InputProfileModel, 'file')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = join(__dirname, 'tmp', `${req.user.userId}`, 'chat');

        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
      },
      filename: (req, file, cb) => cb(null, `${file.originalname}`),
    }),
  }))
  async uploadFileForChat(
    @Req() req,
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    console.log(userId, 'userId');
    console.log(id, 'id');
    console.log(file, 'file');
    await this.chatService.uploadFileForChat(file, userId, id);
    // if (!file) throw new BadRequestException({
    //   message: 'Not a valid file'
    // })
    // const response = await this.profileService.updateProfile(file, profile, userId)
    // return response
  }
}