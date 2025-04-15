import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { GetSubscribesQuery, UnSubscribeRequest, UserForSubscribe } from '../../../../libs/proto/generated/payments';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';

interface PaymentsService {
  CreateSubscribe(data: { user: UserForSubscribe, productKey: number }): Observable<any>;
  GetSubscribes(data: GetSubscribesQuery): Observable<any>;
  UnSubscribe(data: UnSubscribeRequest): Observable<any>;
}

@Injectable()
export class PaymentsClientService implements OnModuleInit {
  private paymentsService: PaymentsService;

  constructor(
    @Inject('PAYMENTS_SERVICE') private client: ClientGrpc, // Имя должно совпадать
  ) { }

  onModuleInit() {
    this.paymentsService = this.client.getService<PaymentsService>('PaymentsService');
  }


  async createSubscribe(user: UserForSubscribe, productKey: number) {
    return lastValueFrom(await this.paymentsService.CreateSubscribe({ user, productKey }));

  }

  async getProfiles(data: GetSubscribesQuery) {
    return lastValueFrom(await this.paymentsService.GetSubscribes(data));
  }

  async unSubscribe(data: UnSubscribeRequest) {
    return lastValueFrom(await this.paymentsService.UnSubscribe(data));
  }

  // async subscribeProfile(userId: string, profileUserId: string) {
  //   return lastValueFrom(await this.paymentsService.SubscribeUserProfile({ userId, profileUserId }));
  // }

  // async createUserProfile(userId: string, userName: string, email: string) {
  //   return lastValueFrom(await this.paymentsService.CreateUserProfile({ userId, userName, email }));
  // }

  // async updateUserProfileSubscribe(userId: string, paymentAccount: boolean) {
  //   return lastValueFrom(await this.paymentsService.UpdateUserProfileSubscribe({ userId, paymentAccount }));
  // }
}