import { Global, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { UpdateUserProfileRequest, UserProfileResponse } from '../../../../libs/proto/generated/profile';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';

const cleanString = (str: string) => {
  return str.replace(/[\n\r\t]+/g, '').trim();
};
interface ProfileService {
  GetUserProfile(data: { userId: string, profileUserId: string }): Observable<UserProfileResponse>;
  GetUserProfiles(data: { userId: string }): Observable<any>;
  UpdateUserProfile(data: UpdateUserProfileRequest): Observable<any>;
  SubscribeUserProfile(data: { userId: string, profileUserId: string }): Observable<any>;
  CreateUserProfile(data: { userId: string, userName: string, email: string }): Observable<any>;
}

@Injectable()
export class ProfileClientService implements OnModuleInit {
  private profileService: ProfileService;

  constructor(
    @Inject('PROFILE_SERVICE') private client: ClientGrpc, // Имя должно совпадать
  ) { }

  onModuleInit() {
    this.profileService = this.client.getService<ProfileService>('ProfileService');
  }

  // async getMessage(id: string) {
  //   return this.messageService.GetMessage({ id }).toPromise();
  // }

  async getProfile(userId: string, profileUserId: string) {
    return firstValueFrom(await this.profileService.GetUserProfile({ userId, profileUserId }));

  }

  async getProfiles(userId: string) {
    return lastValueFrom(await this.profileService.GetUserProfiles({ userId }));
  }

  async updateProfile(data: UpdateUserProfileRequest) {
    return lastValueFrom(await this.profileService.UpdateUserProfile(data));
  }

  async subscribeProfile(userId: string, profileUserId: string) {
    console.log(userId, 'userId')
    console.log(profileUserId, 'profileUserId')
    return lastValueFrom(await this.profileService.SubscribeUserProfile({ userId, profileUserId }));
  }

  async createUserProfile(userId: string, userName: string, email: string) {
    return lastValueFrom(await this.profileService.CreateUserProfile({ userId, userName, email }));
  }
}