import { Injectable } from "@nestjs/common";
import { ProfileClientService } from "apps/gateway/src/support.modules/grpc/grpc.profile.service";
import { UsersService } from "../../user-accounts/users/application/users.service";
import { ProfileMappingService } from "../../profile/application/profile.mapper";
import { PaginationSearchUserGqlTerm } from "../api/utils/pagination";

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly profileClientService: ProfileClientService,
    private readonly profileMappingService: ProfileMappingService,
    private readonly usersService: UsersService,
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
}