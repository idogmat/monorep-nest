import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { UserForSubscribe } from '../../../../libs/proto/generated/payments';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';

interface PaymentsService {
  CreateSubscribe(data: { user: UserForSubscribe, productkey: number }): Observable<any>;

}

@Injectable()
export class PaymentsClientService implements OnModuleInit {
  private profileService: PaymentsService;

  constructor(
    @Inject('PAYMENTS_SERVICE') private client: ClientGrpc, // Имя должно совпадать
  ) { }

  onModuleInit() {
    this.profileService = this.client.getService<PaymentsService>('PaymentsService');
  }


  async createSubscribe(user: UserForSubscribe, productkey: number) {
    return lastValueFrom(await this.profileService.CreateSubscribe({ user, productkey }));

  }

  // async getProfiles(data: UserProfileQueryRequest) {
  //   return lastValueFrom(await this.profileService.GetUserProfiles(data));
  // }

  // async updateProfile(data: UpdateUserProfileRequest) {
  //   return lastValueFrom(await this.profileService.UpdateUserProfile(data));
  // }

  // async subscribeProfile(userId: string, profileUserId: string) {
  //   return lastValueFrom(await this.profileService.SubscribeUserProfile({ userId, profileUserId }));
  // }

  // async createUserProfile(userId: string, userName: string, email: string) {
  //   return lastValueFrom(await this.profileService.CreateUserProfile({ userId, userName, email }));
  // }

  // async updateUserProfileSubscribe(userId: string, paymentAccount: boolean) {
  //   return lastValueFrom(await this.profileService.UpdateUserProfileSubscribe({ userId, paymentAccount }));
  // }
}