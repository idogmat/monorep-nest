import { Controller, Get, Headers, Post, Req } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentsService } from '../features/applications/payments.service';
import { PaymentsRepository } from '../features/infrastructure/payments.repository';
import { CommandBus } from '@nestjs/cqrs';
import { WebhookCommand } from '../features/use-cases/webhook.use-case';
import { GetSubscribesQuery, UnSubscribeRequest, UserForSubscribe } from '../../../libs/proto/generated/payments';
import { PaymentsQueryRepository } from '../features/infrastructure/payments.query-repository';


@Controller()
export class AppController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentsQueryRepository: PaymentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {

  }

  @GrpcMethod('PaymentsService', 'CreateSubscribe')
  async createSubscribe(data: { user: UserForSubscribe, productKey: number }) {
    try {
      console.log(data)
      const { user, productKey } = data
      const customer = await this.paymentsService.findOrCreateCustomer(user)
      const {
        created,
        client_reference_id: referenceUserId,
        url
      } = await this.paymentsService.activateSubscribe(
        customer,
        productKey,
        user.id
      )
      const payment = {
        createdAt: new Date(created * 1000).toISOString(),
        customerId: customer.id,
        userId: referenceUserId
      }
      console.log(url)
      await this.paymentsRepository.createPayment(payment)
      return { url, status: 'ok' }
    } catch (error) {
      console.log(error)
      return { url: '', status: 'fail' }
    }

  }

  @GrpcMethod('PaymentsService', 'GetSubscribes')
  async getSubscribes(data: GetSubscribesQuery) {
    try {
      console.log(data)

      const result = await this.paymentsQueryRepository.getAllPayments(data)
      console.log(result)
      return result
    } catch (error) {
      console.log(error)
      return { url: '', status: 'fail' }
    }

  }

  @GrpcMethod('PaymentsService', 'UnSubscribe')
  async UnSubscribe(data: UnSubscribeRequest) {
    try {
      console.log(data)
      const { userId, paymentId } = data;
      const result = await this.paymentsService.deletePayment(userId, paymentId)
      console.log(result)
      return result
    } catch (error) {
      console.log(error)
      return { url: '', status: 'fail' }
    }

  }

  // @Get()
  // async hello(
  //   @Req() req,
  // ) {
  //   return 'ok'
  // }


  // @Post('webhook')
  // async webHook(
  //   @Req() req,
  //   @Headers('stripe-signature') signature
  // ) {
  //   console.log('ebt')
  //   if (signature)
  //     this.commandBus.execute(
  //       new WebhookCommand(req.rawBody, signature)
  //     );
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