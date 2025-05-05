import { Args, Query, Resolver } from '@nestjs/graphql';
import { PaginatedPost, Post } from './model/input/post.schema';
import { UseGuards } from '@nestjs/common';
import { GqlBasicAuthGuard } from '../../../common/guard/gqlBasicAuthGuard';
import { PostsQueryArgs } from './model/input/posts.query.args';
import { PaginationSearchPostGqlTerm } from '../../superAdmin/api/utils/pagination';
import { PostGraphqlService } from '../application/services/post.graphql.service';

@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly postGraphqlService: PostGraphqlService,
    ) {}

  @UseGuards(GqlBasicAuthGuard)
  @Query(() => PaginatedPost)
  posts(
    @Args() args: PostsQueryArgs
  ) {
    const sanitizedQuery = new PaginationSearchPostGqlTerm(
      {
        offset: args.offset,
        limit: args.limit,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection,
        userId: args.userId,
        description: args.description
      }
      , ['createdAt', 'userId']);
    return this.postGraphqlService.findPosts(sanitizedQuery);
  }

}