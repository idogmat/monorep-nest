import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ProfileService } from '../features/profile.service';
import { ProfilePhotoInputModel } from '../features/model/profilePhoto.input.model';
import { InputProfileModel } from '../features/model/input.profile.model';

@Controller()
export class AppController {
  constructor(readonly profileService: ProfileService) { }

  @Get()
  healthCheck() {
    return this.profileService.findMany({});  // Возвращаем статус микросервиса
  }

  @Post()
  async updateProfile(
    @Headers('X-UserId') userId,
    @Body() data: InputProfileModel
  ) {
    try {
      await this.profileService.updateProfileData(userId, data)
    } catch (error) {
      // save as error
      console.warn(error)
    }
  }

  @Post()
  async createProfile(
    @Body() data: any
  ) {
    try {
      this.profileService.createProfile(data)
    } catch (error) {
      // save as error
      console.warn(error)
    }
  }

  @EventPattern('load_profile_photo')
  async handleTestEvent(data: ProfilePhotoInputModel) {
    try {
      await this.profileService.updateProfilePhoto(data)
    } catch (error) {
      // save as error
      console.warn(error)
    }
  }
}