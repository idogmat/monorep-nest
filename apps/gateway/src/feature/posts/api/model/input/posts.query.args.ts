import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class PostsQueryArgs {

  @Field(() => Int, {nullable: true})
  offset?: number;

  @Field(() => Int, {nullable: true})
  limit?: number;

  @Field({nullable: true})
  sortBy?: string;

  @Field( {nullable: true})
  sortDirection?: 'asc' | 'desc';

  @Field({nullable: true})
  userId?: string;

  @Field({nullable: true})
  description?: string;
}