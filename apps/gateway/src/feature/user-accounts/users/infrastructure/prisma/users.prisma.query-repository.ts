import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma } from '../../../../../../prisma/generated/client';
import { PaginationSearchUserTerm } from '../../../../../common/pagination';


@Injectable()
export class UsersPrismaQueryRepository {
  constructor(private prisma: PrismaService) { }
  async validateUserCred(
    pagination: PaginationSearchUserTerm,

  ) {
    const where: Prisma.UserWhereInput = {};
    const { name, email } = pagination

    if (name) {
      where.name = name
    }
    if (email) {
      where.email = email
    }
    return await
      this.prisma.user.findFirst({
        where,
      })
  }


  async getAll(
    pagination: PaginationSearchUserTerm,

  ) {
    const where: Prisma.UserWhereInput = {};
    const { name, pageNumber, pageSize, sortBy, sortDirection } = pagination;
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive', // для регистронезависимого поиска
      };
    }
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      data: users,
      meta: {
        total,
        pageNumber,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}