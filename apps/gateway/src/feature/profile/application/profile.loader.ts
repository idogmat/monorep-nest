import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { ProfileClientService } from '../../../support.modules/grpc/grpc.profile.service';

@Injectable({ scope: Scope.REQUEST })
export class ProfileLoader {
  constructor(private readonly profileClientService: ProfileClientService)  {}

  public readonly batchProfiles = new DataLoader<string, any | null>(
    async (userIds: readonly string[]) => {
      const response = await this.profileClientService.getUserProfilesGQL({
        users: userIds as string[],
      });
      console.log("response.profiles---------", response.profiles);
      const profileMap = new Map(response.profiles.map(profile => [profile.userId, profile]));
      return  userIds.map(id => profileMap.get(id) ?? null);
    }
  );

}