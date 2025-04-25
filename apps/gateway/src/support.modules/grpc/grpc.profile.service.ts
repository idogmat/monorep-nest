import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { DeleteProfileGQLRequest, UpdateUserProfileRequest, UserProfileQueryRequest, UserProfileResponse, UserProfilesGQLRequest } from '../../../../libs/proto/generated/profile';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';

interface ProfileService {
  GetUserProfile(data: { userId: string, profileUserId: string }): Observable<UserProfileResponse>;
  GetUserProfiles(data: UserProfileQueryRequest): Observable<any>;
  UpdateUserProfile(data: UpdateUserProfileRequest): Observable<any>;
  SubscribeUserProfile(data: { userId: string, profileUserId: string }): Observable<any>;
  CreateUserProfile(data: { userId: string, userName: string, email: string }): Observable<any>;
  UpdateUserProfileSubscribe(data: { userId: string, paymentAccount: boolean }): Observable<any>;
  GetUserProfilesGQL(data: UserProfilesGQLRequest): Observable<any>;
  DeleteProfilesGQL(data: DeleteProfileGQLRequest): Observable<any>;

}

@Injectable()
export class ProfileClientService implements OnModuleInit {
  private profileService: ProfileService;

  constructor(
    @Inject('PROFILE_SERVICE') private client: ClientGrpc,
  ) { }

  onModuleInit() {
    this.profileService = this.client.getService<ProfileService>('ProfileService');
  }


  async getProfile(userId: string, profileUserId: string) {
    return firstValueFrom(await this.profileService.GetUserProfile({ userId, profileUserId }));

  }

  async getProfiles(data: UserProfileQueryRequest) {
    return lastValueFrom(await this.profileService.GetUserProfiles(data));
  }

  async getUserProfilesGQL(data: UserProfilesGQLRequest) {
    return lastValueFrom(await this.profileService.GetUserProfilesGQL(data));
  }

  async updateProfile(data: UpdateUserProfileRequest) {
    return lastValueFrom(await this.profileService.UpdateUserProfile(data));
  }

  async subscribeProfile(userId: string, profileUserId: string) {
    return lastValueFrom(await this.profileService.SubscribeUserProfile({ userId, profileUserId }));
  }

  async createUserProfile(userId: string, userName: string, email: string) {
    return lastValueFrom(await this.profileService.CreateUserProfile({ userId, userName, email }));
  }

  async updateUserProfileSubscribe(userId: string, paymentAccount: boolean) {
    return lastValueFrom(await this.profileService.UpdateUserProfileSubscribe({ userId, paymentAccount }));
  }

  async deleteProfilesGQL(data: DeleteProfileGQLRequest) {
    return lastValueFrom(await this.profileService.DeleteProfilesGQL(data));
  }
}