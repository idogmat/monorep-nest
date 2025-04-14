import { Controller } from '@nestjs/common';


@Controller()
export class AppController {
  constructor() { }

  // @GrpcMethod('ProfileService', 'GetUserProfile')
  // async GetUserProfile(data: { userId: string, profileUserId: string }) {
  //   console.log(data)
  //   let profileForMatchId = ''
  //   if (data?.userId) {
  //     const profile = await this.profileService.findByUserId(data?.userId)
  //     profileForMatchId = profile?.id
  //   }
  //   const result = await this.profileService.findByUserId(data.profileUserId)
  //   if (!result) throw new NotFoundException()
  //   return OutputProfileModelMapper(result, profileForMatchId)
  // }

  // @GrpcMethod('ProfileService', 'GetUserProfiles')
  // async GetUserProfiles(data: UserProfileQueryRequest) {
  //   console.log(data, 'UserProfileQueryRequest')
  //   let profileForMatchId = ''
  //   if (data?.userId) {
  //     const profile = await this.profileService.findByUserId(data?.userId)
  //     profileForMatchId = profile?.id
  //   }
  //   const { items, pageNumber, pageSize, totalCount } = await this.profileService.findMany(data.query);
  //   // console.log(result)
  //   const mapped = items.map(p => OutputProfileModelMapper(p, profileForMatchId))
  //   console.log({ items: mapped, pageNumber, pageSize, totalCount })

  //   return { items: mapped, pageNumber, pageSize, totalCount }
  // }

  // @GrpcMethod('ProfileService', 'UpdateUserProfile')
  // async updateProfileGrpc(
  //   data: UpdateUserProfileRequest
  // ) {
  //   console.log(data, 'updateProfile')

  //   try {
  //     await this.profileService.updateProfileData(data.userId, data);
  //     return { status: 'ok' };
  //   } catch (error) {
  //     console.log(error)
  //     return { status: 'fail' };
  //     console.warn(error)
  //   }
  // }

  // @GrpcMethod('ProfileService', 'SubscribeUserProfile')
  // async subscribeProfileGrpc(
  //   data: SubscribeProfileRequest
  // ) {
  //   console.log('SubscribeUserProfile', data,)
  //   try {
  //     const { userId, profileUserId } = data
  //     const result = await this.profileService.subscribe(userId, profileUserId)
  //     console.log(result, 'result')
  //     return { status: 'ok' };
  //   } catch (error) {
  //     console.warn(error)
  //     return { status: 'fail' };
  //   }
  // }

  // @GrpcMethod('ProfileService', 'CreateUserProfile')
  // async createProfile(
  //   data: CreateUserProfileRequest
  // ) {
  //   console.log(data)
  //   try {
  //     await this.profileService.createProfile(data)
  //     return { status: 'ok' };
  //   } catch (error) {
  //     // save as error
  //     console.warn(error)
  //     return { status: 'fail' };
  //   }
  // }

  // @GrpcMethod('ProfileService', 'UpdateUserProfileSubscribe')
  // async updateProfileSubscribe(
  //   data: UserProfileUpdateSubscribeRequest
  // ) {
  //   console.log(data)
  //   try {
  //     await this.profileService.updateProfilePayment(data.userId, data.paymentAccount)
  //     return { status: 'ok' };
  //   } catch (error) {
  //     // save as error
  //     console.warn(error)
  //     return { status: 'fail' };
  //   }
  // }

  // @EventPattern('load_profile_photo')
  // async handleTestEvent(data: ProfilePhotoInputModel) {
  //   console.log(data, 'handleTestEvent')

  //   try {
  //     await this.profileService.updateProfilePhoto(data)
  //   } catch (error) {
  //     // save as error
  //     console.warn(error)
  //   }
  // }
}