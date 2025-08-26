import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes, ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ProfileService } from '../application/profile.service';
import { mkdir } from 'fs/promises';
import { AuthGuard } from '../../../common/guard/authGuard';
import { GateService } from '../../../common/gate.service';
import { InputProfileModel } from './model/input/input.profile.model';
import { EnhancedParseUUIDPipe } from '../../../../../libs/input.validate/check.uuid-param';
import { Request } from 'express';
import { AuthGuardOptional } from '../../../common/guard/authGuardOptional';
import { ProfileClientService } from '../../../support.modules/grpc/grpc.profile.service';
import { ProfileMappingService } from '../application/profile.mapper';
import { ApiFileWithDto, UpdateProfileApiDecorator, UserProfileResponseDto } from './swagger.discription.ts';
import { PaginationProfileQueryDto } from './model/input/pagination.profile.query.dto';
import { PaginationSearchProfileTerm } from './model/input/query.profile.model';
import { PagedResponseOfProfiles } from './model/output/paged.response.of.profiles.model';
import { PagedResponse } from '../../../common/pagination/paged.response';
import { UpdateUserProfileRequest } from 'aws-sdk/clients/opsworks';
import { UpdateProfileModel } from './model/input/update.profile.model';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  private readonly uploadsDir = './tmp/chunks';
  private readonly localFileName = 'test.png';
  constructor(
    readonly profileService: ProfileService,
    readonly gateService: GateService,
    private readonly profileClientService: ProfileClientService,
    private readonly profileMappingService: ProfileMappingService,


  ) {
    mkdir(this.uploadsDir, { recursive: true });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuardOptional)
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched profile',
    type: UserProfileResponseDto,  // Указываем PagedResponse без указания типа
  })
  async getProfileGrpc(
    @Req() req: Request,
    @Param('id', new EnhancedParseUUIDPipe()) id: string
  ) {
    try {
      const userId = req.user?.userId || ''
      const result = await this.profileClientService.getProfile(userId, id)
      console.log(result)
      return this.profileMappingService.profileMapping(result)
    } catch (error) {
      throw error
    }
  }

  @Delete('photo')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Successfully delete profile photo',
  })
  async deleteProfilePhotoGrpc(
    @Req() req: Request,
  ) {
    try {
      const userId = req.user?.userId || ''
      console.log(userId)
      const result = await this.profileClientService.deleteProfilePhoto({ userId })
      console.log(result)
      return result
    } catch (error) {
      throw error
    }
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuardOptional)
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched profiles',
    type: PagedResponseOfProfiles
  })
  async getProfilesGrpc(
    @Req() req: Request,
    @Query() queryDTO: PaginationProfileQueryDto
  ) {
    try {
      const query = new PaginationSearchProfileTerm(queryDTO, ['createdAt']);
      const userId = req.user?.userId || ''
      const { items, pageNumber, pageSize, totalCount } = await this.profileClientService.getProfiles({ userId, query })
      const mapped = items.map(this.profileMappingService.profileMapping)
      return new PagedResponse<UserProfileResponseDto>(mapped, totalCount, pageNumber, pageSize);

    } catch (e) {
      console.warn(e)
    }

  }

  @Put('edit')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiFileWithDto(InputProfileModel, 'file')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = join(__dirname, 'tmp', `${req.user.userId}`, 'profile');

        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
      },
      filename: (req, file, cb) => cb(null, `${file.originalname}`),
    }),
  }))
  async editProfile(
    @Req() req,
    @Body() profile: InputProfileModel,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    if (!file) throw new BadRequestException({
      message: 'Not a valid file'
    })
    const response = await this.profileService.updateProfile(file, profile, userId)
    return response
  }

  @Patch()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({
    whitelist: true,       // удаляет лишние поля
    forbidNonWhitelisted: true, // бросает ошибку при лишних полях
    transform: true        // автоматическая трансформация типов
  }))
  @UpdateProfileApiDecorator()
  async updateProfile(
    @Req() req,
    @Body() profile: UpdateProfileModel,  // Все поля теперь необязательные
  ) {

    const response = await this.profileService.updateProfileData(
      profile as Partial<UpdateUserProfileRequest>, req.user.userId);
    console.log("updateProfile patch--------", response);
    return response;

  }

  @Patch('subscribe/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async subscribe(
    @Req() req,
    @Param('id') id: string
  ) {
    if (req.user.userId === id) throw new ForbiddenException()
    try {
      await this.profileService.subscribe(req.user.userId, id)
    } catch (e) {
      const error = e.response?.data?.toString() || 'Not a valid'
      throw new BadRequestException({
        message: error
      })
    }
  }

}