import { Global, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface ProfileService {
  GetUserProfile(data: { userId: string, profileUserId: string }): Observable<any>;
  GetUserProfiles(data: { userId: string }): Observable<any>;

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
    return this.profileService.GetUserProfile({ userId, profileUserId }).toPromise();
  }

  async getProfiles(userId: string) {
    return this.profileService.GetUserProfiles({ userId }).toPromise();
  }
}