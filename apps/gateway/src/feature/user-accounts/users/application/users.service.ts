import { BadRequestException, Injectable } from '@nestjs/common';

import { User } from '../../../../../prisma/generated/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaginationSearchUserGqlTerm } from '../../../superAdmin/api/utils/pagination';


@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  // async createUser(data: { email: string; name?: string }): Promise<User> {
  //   // return this.prisma.user.create({ data });
  // }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async deleteUser(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new BadRequestException()
    return this.prisma.user.delete({ where: { id } });
  }

  async banUser(id: string, bannedReason: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new BadRequestException()
    return this.prisma.user.update({ where: { id }, data: { banned: true, bannedReason } });
  }

  async getAllUsersGql(query: PaginationSearchUserGqlTerm): Promise<{ users: User[] } & { totalCount: number }> {
    const settings = {
      skip: query.offset ?? 0,
      take: query.limit ?? undefined,
      orderBy: {
        [query.sortBy]: query.sortDirection.toLocaleLowerCase()
      },
    }
    if (query.name) Object.assign(settings, {
      where: {
        name: {
          contains: query.name,
          mode: 'insensitive',
        }
      }
    })
    const querySettings = this.prisma.user.findMany(settings);

    const [users, totalCount] = await Promise.all([
      querySettings,
      this.prisma.user.count(settings)
    ]);

    return { users, totalCount };
  }

  async getUsersByIds(ids: string[]) {

    return this.prisma.user.findMany({
      where: {
        id: {
          in: ids,
        }
      }
    })
  }
}