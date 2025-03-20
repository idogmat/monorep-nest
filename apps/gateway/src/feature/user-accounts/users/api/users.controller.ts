import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { PaginationSearchUserTerm } from '../../../../common/pagination';
import { UsersPrismaQueryRepository } from '../infrastructure/prisma/users.prisma.query-repository';
import { ApiResponse } from '@nestjs/swagger';
import { ValidationUserModel } from '../infrastructure/prisma/dto/validation.user.model';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersPrismaQueryRepository: UsersPrismaQueryRepository
  ) { }

  @ApiResponse({ status: 200, description: 'Match name or email' })
  @Get('validation')
  async validateUserCred(
    @Query() query: ValidationUserModel,
  ) {
    const pagination: PaginationSearchUserTerm =
      new PaginationSearchUserTerm(
        query as any,
        [],
      );
    const user =
      await this.usersPrismaQueryRepository.validateUserCred(pagination);

    return !user;
  }

  @Get()
  async findAll(
    @Query() query: any,
  ) {
    const pagination: PaginationSearchUserTerm =
      new PaginationSearchUserTerm(
        query,
        [],
      );
    const users: any =
      await this.usersPrismaQueryRepository.getAll(pagination);

    return users;
  }
}