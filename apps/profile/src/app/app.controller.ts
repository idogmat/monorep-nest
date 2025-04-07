import { Body, Controller, Get, Headers, NotFoundException, Param, Patch, Post, Put, Query, Req, Res } from '@nestjs/common';
import { EventPattern, GrpcMethod } from '@nestjs/microservices';
import { ProfileService } from '../features/profile.service';
import { ProfilePhotoInputModel } from '../features/model/profilePhoto.input.model';
import { InputProfileModel } from '../features/model/input.profile.model';
import { EnhancedParseUUIDPipe } from 'apps/libs/input.validate/check.uuid-param';
import { InputSubscribeModel } from '../features/model/input.subscribe.model';
import { Response } from 'express';
import { OutputProfileModelMapper } from '../features/model/profile.output.model';
import { UpdateUserProfileRequest } from '../../../libs/proto/generated/profile';

@Controller()
export class AppController {
  constructor(readonly profileService: ProfileService) { }

  @GrpcMethod('ProfileService', 'GetUserProfile')
  async GetUserProfile(data: { userId: string, profileUserId: string }) {
    console.log(data)
    let profileForMatchId = ''
    if (data?.userId) {
      const profile = await this.profileService.findByUserId(data?.userId)
      profileForMatchId = profile?.id
    }
    const result = await this.profileService.findByUserId(data.profileUserId)
    if (!result) throw new NotFoundException()
    return OutputProfileModelMapper(result, profileForMatchId)
  }

  @GrpcMethod('ProfileService', 'GetUserProfiles')
  async GetUserProfiles(data: { userId: string }) {
    console.log(data?.userId)
    let profileForMatchId = ''
    if (data?.userId) {
      const profile = await this.profileService.findByUserId(data?.userId)
      profileForMatchId = profile?.id
    }
    const result = await this.profileService.findMany();
    const ready = result.map(p => OutputProfileModelMapper(p, profileForMatchId))
    console.log(ready)

    return { profiles: ready }
  }

  @GrpcMethod('ProfileService', 'UpdateUserProfile')
  async updateProfileGrpc(
    data: any
  ) {
    console.log(data, 'updateProfile')

    try {
      await this.profileService.updateProfileData(data.userId, data);
      return { status: 'ok' };
    } catch (error) {
      console.log(error)
      return { status: 'fail' };
      console.warn(error)
    }
  }

  @Get(':id')
  async getProfile(
    @Headers('X-UserId') userId,
    @Param('id', new EnhancedParseUUIDPipe()) id: string
  ) {
    console.log(userId)
    let profileForMatchId = ''
    if (userId) {
      const profile = await this.profileService.findByUserId(userId)
      profileForMatchId = profile?.id
    }
    const result = await this.profileService.findByUserId(id)
    if (!result) throw new NotFoundException()
    return OutputProfileModelMapper(result, profileForMatchId)
  }

  @Get()
  async getProfiles(
    @Headers('X-UserId') userId,
    // @Query() query: any
    // @Req() req
  ) {
    console.log(userId)
    let profileForMatchId = ''
    if (userId) {
      const profile = await this.profileService.findByUserId(userId)
      profileForMatchId = profile?.id
    }
    const result = await this.profileService.findMany();

    return result.map(p => OutputProfileModelMapper(p, profileForMatchId))
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

  @Post('subscribe')
  async subscribe(
    @Body() sub: InputSubscribeModel,
    @Res() res: Response
  ) {
    // console.log(data, 'updateProfile')
    console.log(sub, 'sub')
    try {
      const { userId, subscribeUserId } = sub
      const result = await this.profileService.subscribe(userId, subscribeUserId)
      console.log(result, 'result')
      res.status(200).send()
    } catch (error) {
      //   // save as error
      console.warn(error)
      res.status(400).json(error.message)
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

  @EventPattern('test_rabbit')
  async testRabbit(data: ProfilePhotoInputModel) {
    console.log(data, 'test_rabbit')
  }
}