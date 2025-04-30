import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { UsersService } from '../../users/application/users.service';
import { User } from '../../../superAdmin/api/models/user.schema';
@Injectable({ scope: Scope.REQUEST })
export class UserLoader {
  constructor(private readonly usersService: UsersService) {}

  public readonly batchUsers = new DataLoader<string, User | null>(async (userIds) => {

    console.log('BATCHING FOR IDS:', userIds);

    const users = await this.usersService.getUsersByIds(userIds as string[]);

    const usersMap = new Map(users.map(user => [user.id, user]));

    return userIds.map(id => usersMap.get(id) ?? null);
  })
}