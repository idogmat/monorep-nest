import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SuperAdminService } from '../../application/superAdmin.service';
import { UseGuards } from '@nestjs/common';
import { GqlBasicAuthGuard } from '../../../../common/guard/gqlBasicAuthGuard';
import { PaginatedUsers, User } from '../models/user.schema';
import { PaginationSearchFollowersGqlTerm, PaginationSearchPaymentGqlTerm, PaginationSearchUserGqlTerm } from '../utils/pagination';
import { PaginatedPayments } from '../models/payment.schema';
import e from 'express';
import { PaginatedFollowers } from '../models/follower.schema';
import { PaginatedFollowing } from '../models/following.schema';

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

  @UseGuards(GqlBasicAuthGuard)
  @Query(() => PaginatedPayments)
  async payments(
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('sortBy', { type: () => String, nullable: true }) sortBy?: string,
    @Args('sortDirection', { type: () => String, nullable: true }) sortDirection?: 'asc' | 'desc',
    @Args('userId', { type: () => String, nullable: true }) userId?: string,
  ) {
    const sanitizedQuery = new PaginationSearchPaymentGqlTerm(
      {
        offset: offset,
        limit: limit,
        sortBy, sortDirection, userId
      }
      , ['createdAt', 'amount']);
    console.log(sanitizedQuery)
    const res = await this.superAdminService.findPayments(sanitizedQuery);
    console.log(res, 'res')
    let payments = []
    if (res.items?.length) {
      payments = res.items.map(i => ({
        ...i,
        createdAt: i.createdAt ? new Date(i.createdAt).toISOString() : null,
        expiresAt: i.expiresAt ? new Date(i.expiresAt).toISOString() : null,
        deletedAt: i.deletedAt ? new Date(i.deletedAt).toISOString() : null
      }))
    }
    return { payments, totalCount: res.totalCount };
  }

  @UseGuards(GqlBasicAuthGuard)
  @Query(() => PaginatedFollowers)
  async followers(
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('sortBy', { type: () => String, nullable: true }) sortBy?: string,
    @Args('sortDirection', { type: () => String, nullable: true }) sortDirection?: 'asc' | 'desc',
    @Args('userId', { type: () => String, nullable: true }) userId?: string,
  ) {
    const sanitizedQuery = new PaginationSearchFollowersGqlTerm(
      {
        offset: offset,
        limit: limit,
        sortBy, sortDirection, userId
      }
      , ['createdAt']);
    console.log(sanitizedQuery)
    const res = await this.superAdminService.getFollowers(sanitizedQuery);
    console.log(res, 'res')
    let followers = []
    if (res.items?.length) {
      followers = res.items.map(i => ({
        ...i,
        createdAt: i.createdAt ? new Date(i.createdAt).toISOString() : null,
      }))
    }
    return { followers, totalCount: res.totalCount };
  }

  @UseGuards(GqlBasicAuthGuard)
  @Query(() => PaginatedFollowing)
  async following(
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('sortBy', { type: () => String, nullable: true }) sortBy?: string,
    @Args('sortDirection', { type: () => String, nullable: true }) sortDirection?: 'asc' | 'desc',
    @Args('userId', { type: () => String, nullable: true }) userId?: string,
  ) {
    const sanitizedQuery = new PaginationSearchFollowersGqlTerm(
      {
        offset: offset,
        limit: limit,
        sortBy, sortDirection, userId
      }
      , ['createdAt']);
    console.log(sanitizedQuery)
    const res = await this.superAdminService.getFollowing(sanitizedQuery);
    console.log(res, 'res')
    let following = []
    if (res.items?.length) {
      following = res.items.map(i => ({
        ...i,
        createdAt: i.createdAt ? new Date(i.createdAt).toISOString() : null,
      }))
    }
    return { following, totalCount: res.totalCount };
  }
}