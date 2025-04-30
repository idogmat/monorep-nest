import { Resolver, Query, Mutation, Args, Int} from '@nestjs/graphql';
import { SuperAdminService } from '../application/superAdmin.service';
import { UseGuards } from '@nestjs/common';
import { GqlBasicAuthGuard } from '../../../common/guard/gqlBasicAuthGuard';
import { PaginatedUsers, User } from './models/user.schema';
import { PaginationSearchPaymentGqlTerm, PaginationSearchUserGqlTerm } from './utils/pagination';
import { PaginatedPayments } from './models/payment.schema';

@Resolver(() => User)
export class SuperAdminResolver {
  constructor(
    private readonly superAdminService: SuperAdminService
  ) { }

  @UseGuards(GqlBasicAuthGuard)
  @Query(() => PaginatedUsers)
  users(
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('sortBy', { type: () => String, nullable: true }) sortBy?: string,
    @Args('sortDirection', { type: () => String, nullable: true }) sortDirection?: 'asc' | 'desc',
    @Args('name', { type: () => String, nullable: true }) name?: string,
  ) {
    const sanitizedQuery = new PaginationSearchUserGqlTerm(
      {
        offset: offset,
        limit: limit,
        sortBy, sortDirection, name
      }
      , ['createdAt', 'name']);
    return this.superAdminService.findUsers(sanitizedQuery);
  }

  @UseGuards(GqlBasicAuthGuard)
  @Mutation(() => Boolean)
  async deleteUser(
    @Args('id', { type: () => String }) id: string
  ): Promise<boolean> {
    if (!id) return false
    return this.superAdminService.deleteUser(id);
  }

  @UseGuards(GqlBasicAuthGuard)
  @Mutation(() => Boolean)
  async bunUser(
    @Args('id', { type: () => String }) id: string,
    @Args('banReason', { type: () => String }) banReason: string
  ): Promise<boolean> {
    if (!id || !banReason) return false
    console.log(id, banReason)
    return this.superAdminService.banUser(id, banReason);
  }


  // @UseGuards(GqlBasicAuthGuard)
  // @Query(() => PaginatedPost)
  // posts(
  //   @Args() args: PostsQueryArgs
  // ) {
  //   const sanitizedQuery = new PaginationSearchPostGqlTerm(
  //     {
  //       offset: args.offset,
  //       limit: args.limit,
  //       sortBy: args.sortBy,
  //       sortDirection: args.sortDirection,
  //       userId: args.userId,
  //       description: args.description
  //     }
  //     , ['createdAt', 'userId']);
  //   return this.superAdminService.findPosts(sanitizedQuery);
  // }

  @UseGuards(GqlBasicAuthGuard)
  @Query(() => PaginatedPayments)
  payments(
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('sortBy', { type: () => String, nullable: true }) sortBy?: string,
    @Args('sortDirection', { type: () => String, nullable: true }) sortDirection?: 'asc' | 'desc',
    @Args('name', { type: () => String, nullable: true }) name?: string,
  ) {
    const sanitizedQuery = new PaginationSearchPaymentGqlTerm(
      {
        offset: offset,
        limit: limit,
        sortBy, sortDirection, name
      }
      , ['createdAt', 'amount', 'name']);
    // return this.superAdminService.findPayments(sanitizedQuery);
    return { payments: [], totalCount: 0 };
  }
  // @Mutation(() => User)
  // createUser(@Args('createUserInput') input: CreateUserInput) {
  //   return this.userService.create(input);
  // }
}