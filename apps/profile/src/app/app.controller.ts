import { Body, Controller, Get, Headers, Param, Post, Put, Query, Req } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ProfileService } from '../features/profile.service';
import { ProfilePhotoInputModel } from '../features/model/profilePhoto.input.model';
import { InputProfileModel } from '../features/model/input.profile.model';
import { EnhancedParseUUIDPipe } from 'apps/libs/input.validate/check.uuid-param';

@Controller()
export class AppController {
  constructor(readonly profileService: ProfileService) { }


  @Get(':id')
  async getProfile(
    @Param('id', new EnhancedParseUUIDPipe()) id: string
  ) {
    console.log(id)
    return await this.profileService.findByUserId(id)
  }

  @Get()
  async getProfiles(
    // @Query() query: any
    // @Req() req
  ) {
    // console.log(req.query)
    // console.log(query)
    return await this.profileService.findMany({});
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

  @Put()
  async updateProfile(
    @Headers('X-UserId') userId,
    @Body() data: InputProfileModel
  ) {
    console.log(data, 'updateProfile')
    console.log(userId, 'userId')
    try {
      await this.profileService.updateProfileData(userId, data)
    } catch (error) {
      // save as error
      console.warn(error)
    }
  }



  @EventPattern('load_profile_photo')
  async handleTestEvent(data: ProfilePhotoInputModel) {
    console.log(data, 'handleTestEvent')

    try {
      await this.profileService.updateProfilePhoto(data)
    } catch (error) {
      // save as error
      console.warn(error)
    }
  }
}