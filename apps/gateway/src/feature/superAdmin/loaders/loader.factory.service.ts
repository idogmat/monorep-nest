import { Injectable } from '@nestjs/common';
import { UsersService } from '../../user-accounts/users/application/users.service';
import { User } from '../api/models/user.schema';
import DataLoader from 'dataloader';

@Injectable()
export class LoaderFactoryService {
  constructor(private readonly usersService: UsersService) {}

  createLoaders() {
    return {
      userLoader: new DataLoader<string, User | null>(async (userIds) => {
        console.log('📦 Batching user IDs:', userIds);

        const users = await this.usersService.getUsersByIds(userIds as string[]);
        const usersMap = new Map(users.map(user => [user.id, user]));
        return userIds.map(id => usersMap.get(id) ?? null);
      }),
    };
  }
}
