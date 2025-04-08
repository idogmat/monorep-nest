import { Controller, NotFoundException, } from '@nestjs/common';
import { EventPattern, GrpcMethod } from '@nestjs/microservices';
import { ProfileService } from '../features/profile.service';
import { ProfilePhotoInputModel } from '../features/model/profilePhoto.input.model';
import { OutputProfileModelMapper } from '../features/model/profile.output.model';
import { UserProfileQueryRequest } from '../../../libs/proto/generated/profile';

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
  async GetUserProfiles(data: UserProfileQueryRequest) {
    console.log(data, 'UserProfileQueryRequest')
    let profileForMatchId = ''
    if (data?.userId) {
      const profile = await this.profileService.findByUserId(data?.userId)
      profileForMatchId = profile?.id
    }
    const { items, pageNumber, pageSize, totalCount } = await this.profileService.findMany(data.query);
    // console.log(result)
    const mapped = items.map(p => OutputProfileModelMapper(p, profileForMatchId))
    console.log({ items: mapped, pageNumber, pageSize, totalCount })

    return { items: mapped, pageNumber, pageSize, totalCount }
    return
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

  @GrpcMethod('ProfileService', 'SubscribeUserProfile')
  async subscribeProfileGrpc(
    data: any
  ) {
    console.log('SubscribeUserProfile', data,)
    try {
      const { userId, profileUserId } = data
      const result = await this.profileService.subscribe(userId, profileUserId)
      console.log(result, 'result')
      return { status: 'ok' };
    } catch (error) {
      console.warn(error)
      return { status: 'fail' };
    }
  }

  @GrpcMethod('ProfileService', 'CreateUserProfile')
  async createProfile(
    data: any
  ) {
    console.log(data)
    try {
      await this.profileService.createProfile(data)
      return { status: 'ok' };
    } catch (error) {
      // save as error
      console.warn(error)
      return { status: 'fail' };
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