import { Inject, Injectable } from "@nestjs/common";
import { ProfileClientService } from "../../../support.modules/grpc/grpc.profile.service";
import { UsersService } from "../../user-accounts/users/application/users.service";
import { ProfileMappingService } from "../../profile/application/profile.mapper";
import { PaginationSearchFollowersGqlTerm, PaginationSearchPaymentGqlTerm, PaginationSearchUserGqlTerm } from '../api/utils/pagination';
import { PostMicroserviceService } from '../../posts/application/services/post.microservice.service';
import { DeviceService } from "../../user-accounts/devices/application/device.service";
import { ClientProxy } from "@nestjs/microservices";
import { PaymentsClientService } from "../../../support.modules/grpc/grpc.payments.service";

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly profileClientService: ProfileClientService,
    private readonly paymentsClientService: PaymentsClientService,
    private readonly profileMappingService: ProfileMappingService,
    private readonly usersService: UsersService,
    private readonly deviceService: DeviceService,
    private postMicroserviceService: PostMicroserviceService,
    @Inject('RABBITMQ_POST_BAN_SERVICE') private readonly rabbitClient: ClientProxy
  ) { }
  async findUsers(query: PaginationSearchUserGqlTerm
  ): Promise<{ users: any[], totalCount: number }> {
    try {
      const { users, totalCount } = await this.usersService.getAllUsersGql(query)
      const ids = users.map(u => u.id)
      const { profiles } = await this.profileClientService.getUserProfilesGQL({ users: ids })
      const mappedProfiles = profiles.map(this.profileMappingService.profileMapping)
      return {
        users: users.map(user => ({
          ...user,
          profile: mappedProfiles.find(p => p.userId === user.id)
        })), totalCount
      }

    } catch (e) {

      console.log(e, 'fail')
      return { users: [], totalCount: 0 };
    }
  }

  async findPayments(query: PaginationSearchPaymentGqlTerm
  ): Promise<{ items: any[], totalCount: number }> {
    try {
      console.log(query)
      const { items, totalCount } = await this.paymentsClientService.getSubscribesGql(query)
      return { items, totalCount }

    } catch (e) {

      console.log(e, 'fail')
      return { items: [], totalCount: 0 };
    }
  }


  async getFollowers(query: PaginationSearchFollowersGqlTerm
  ): Promise<{ items: any[], totalCount: number }> {
    try {
      console.log(query)
      const { items, totalCount } = await this.profileClientService.getFollowersGql(query)
      console.log({ items, totalCount }, 'gate')
      return { items, totalCount }

    } catch (e) {

      console.log(e, 'fail')
      return { items: [], totalCount: 0 };
    }
  }

  async getFollowing(query: PaginationSearchFollowersGqlTerm
  ): Promise<{ items: any[], totalCount: number }> {
    try {
      console.log(query)
      const { items, totalCount } = await this.profileClientService.getFollowingGql(query)
      console.log({ items, totalCount }, 'gate')
      return { items, totalCount }

    } catch (e) {

      console.log(e, 'fail')
      return { items: [], totalCount: 0 };
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const profileUserDeleted = await this.profileClientService.deleteProfilesGQL({ userId })
      console.log(profileUserDeleted)
      const sessionsUserDeleted = await this.deviceService.deleteAllSessionBeforDeleteUser(userId)
      console.log(sessionsUserDeleted)
      const userDeleted = await this.usersService.deleteUser(userId)
      console.log(userDeleted)
      return true
    } catch (e) {
      console.log(e, 'fail')
      return false;
    }
  }

  async banUser(userId: string, bannedReason: string): Promise<boolean> {
    try {
      const profileUserBanned = await this.profileClientService.banProfileGQL({ userId })
      console.log(profileUserBanned)
      const sessionsUserDeleted = await this.deviceService.deleteAllSessionBeforDeleteUser(userId)
      console.log(sessionsUserDeleted)
      const userBanned = await this.usersService.banUser(userId, bannedReason)
      console.log(userBanned)
      this.rabbitClient.emit('ban_posts', userId);
      return true
    } catch (e) {
      console.log(e, 'fail')
      return false;
    }
  }


}