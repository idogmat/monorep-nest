import { Controller, NotFoundException, } from '@nestjs/common';
import { EventPattern, GrpcMethod, RpcException } from '@nestjs/microservices';
import { ProfileService } from '../features/profile.service';
import { ProfilePhotoInputModel } from '../features/model/profilePhoto.input.model';
import {
  OutputProfileModelMapper,
  OutputProfileUpdateModel,
  OutputProfileUpdateModelMapper,
} from '../features/model/profile.output.model';
import { CreateUserProfileRequest, DeleteProfileGQLRequest, GetFollowersGqlQuery, SubscribeProfileRequest, UpdateUserProfileRequest, UserProfileQueryRequest, UserProfilesGQLRequest, UserProfileUpdateSubscribeRequest } from '../../../libs/proto/generated/profile';
import { Status } from '@grpc/grpc-js/build/src/constants';


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
  }

  @GrpcMethod('ProfileService', 'GetFollowersGql')
  async getFollowersGql(data: GetFollowersGqlQuery) {
    console.log(data, 'GetFollowersGql')
    const { items, totalCount } = await this.profileService.getFollowers(data)
    const mappedFolowers = items?.map(f => {
      const { subscriber, profile, ...rest } = f
      return {
        ...rest,
        subscriberUserName: subscriber?.userName,
        subscriberUserId: subscriber?.userId,
        profileUserId: profile?.userId,
      }
    }) || []
    console.log(mappedFolowers)

    return { items: mappedFolowers, totalCount }
  }

  @GrpcMethod('ProfileService', 'GetFollowingGql')
  async getFollowingGql(data: GetFollowersGqlQuery) {
    console.log(data, 'GetFollowingGql')
    const { items, totalCount } = await this.profileService.getFollowing(data)
    const mappedFolowers = items?.map(f => {
      const { subscriber, profile, ...rest } = f
      return {
        ...rest,
        profileUserName: profile?.userName,
        subscriberUserId: subscriber?.userId,
        profileUserId: profile?.userId,
      }
    }) || []
    console.log(mappedFolowers)

    return { items: mappedFolowers, totalCount }
  }

  @GrpcMethod('ProfileService', 'UpdateUserProfile')
  async updateProfileGrpc(
    data: UpdateUserProfileRequest
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

  @GrpcMethod('ProfileService', 'UpdateUserProfileData')
  async updateProfileDataGrpc(
    data: Partial<UpdateUserProfileRequest>
  ): Promise<OutputProfileUpdateModel> {

    try {
      const updatedProfile = await this.profileService.updateProfileFields(data.userId, data);

      const mapData =  OutputProfileUpdateModelMapper(updatedProfile);

      console.log("mapData ------", mapData);
      return mapData;
    } catch (error) {
      const grpcErrorMap = {
        NotFoundError: Status.NOT_FOUND,
        ValidationError: Status.INVALID_ARGUMENT,
        PrismaClientKnownRequestError: Status.ABORTED,
        default: Status.INTERNAL
      };

      const code = grpcErrorMap[error.constructor.name] || grpcErrorMap.default;

      throw new RpcException({
        code,
        message: error.message || 'Profile update failed'
      });
    }
  }

  @GrpcMethod('ProfileService', 'SubscribeUserProfile')
  async subscribeProfileGrpc(
    data: SubscribeProfileRequest
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
    data: CreateUserProfileRequest
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

  @GrpcMethod('ProfileService', 'UpdateUserProfileSubscribe')
  async updateProfileSubscribe(
    data: UserProfileUpdateSubscribeRequest
  ) {
    console.log(data)
    try {
      await this.profileService.updateProfilePayment(data.userId, data.paymentAccount)
      return { status: 'ok' };
    } catch (error) {
      // save as error
      console.warn(error)
      return { status: 'fail' };
    }
  }

  @GrpcMethod('ProfileService', 'GetUserProfilesGQL')
  async GetUserProfilesGQL(
    data: UserProfilesGQLRequest
  ) {
    try {
      const { users } = data
      const result = await this.profileService.findForGql(users)
      const profiles = result.map(p => OutputProfileModelMapper(p))

      return { profiles };
    } catch (error) {
      // save as error
      console.warn(error)
      return { status: 'fail' };
    }
  }

  @GrpcMethod('ProfileService', 'DeleteProfilesGQL')
  async deleteProfilesGQL(
    data: DeleteProfileGQLRequest
  ) {
    try {
      const result = await this.profileService.deleteProfile(data.userId)
      console.log(result)
      return { status: 'ok' };
    } catch (error) {
      // save as error
      console.warn(error)
      return { status: 'fail' };
    }
  }

  @GrpcMethod('ProfileService', 'BanProfileGQL')
  async banProfileGQL(
    data: DeleteProfileGQLRequest
  ) {
    try {
      const result = await this.profileService.banProfile(data.userId)
      console.log(result)
      return { status: 'ok' };
    } catch (error) {
      // save as error
      console.warn(error)
      return { status: 'fail' };
    }
  }

  @EventPattern('load_profile_photo')
  async handleLoadProfilePhoto(data: ProfilePhotoInputModel) {
    console.log(data, 'load_profile_photo')

    try {
      await this.profileService.updateProfilePhoto(data)
    } catch (error) {
      // save as error
      console.warn(error)
    }
  }

  @EventPattern('update_profile_account')
  async updateProfileAccount(
    data:
      { userId: string, paymentAccount: boolean }[]
  ) {
    console.log(data, 'update_profile_account')
    try {
      for (const u of data) {
        await this.profileService.updateProfilePayment(u.userId, u.paymentAccount)
      }
    } catch (error) {
      // save as error
      console.warn(error)
    }
  }
}