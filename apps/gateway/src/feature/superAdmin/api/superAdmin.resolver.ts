import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SuperAdminService } from '../application/superAdmin.service';
import { UseGuards } from '@nestjs/common';
import { GqlBasicAuthGuard } from '../../../common/guard/gqlBasicAuthGuard';
import { PaginatedUsers, User } from './models/user.schema';
import { PaginationSearchPostGqlTerm, PaginationSearchUserGqlTerm } from './utils/pagination';
import { PaginatedPost } from './models/post.schema';

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
  async deleteUser(@Args('id', { type: () => String }) id: string): Promise<boolean> {
    if (!id) return false
    return this.superAdminService.deleteUser(id);
  }

  @UseGuards(GqlBasicAuthGuard)
  @Query(() => PaginatedPost)
  posts(
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('sortBy', { type: () => String, nullable: true }) sortBy?: string,
    @Args('sortDirection', { type: () => String, nullable: true }) sortDirection?: 'asc' | 'desc',
    @Args('userId', { type: () => String, nullable: true }) userId?: string,
    @Args('description', { type: () => String, nullable: true }) description?: string,
  ) {
    const sanitizedQuery = new PaginationSearchPostGqlTerm(
      {
        offset: offset,
        limit: limit,
        sortBy, sortDirection, userId, description
      }
      , ['createdAt', 'userId']);
    return this.superAdminService.findPosts(sanitizedQuery);
  }

  // @Mutation(() => User)
  // createUser(@Args('createUserInput') input: CreateUserInput) {
  //   return this.userService.create(input);
  // }
}