import { Field, ObjectType } from "@nestjs/graphql";
@ObjectType()
export class PaginatedFollowers {
  @Field(() => [Follower])
  followers: Follower[];

  @Field()
  totalCount?: number;
}

@ObjectType()
export class Follower {

  @Field({ nullable: true })
  subscriberId?: string;

  @Field({ nullable: true })
  profileId?: string;

  @Field({ nullable: true })
  profileUserId?: string;

  @Field({ nullable: true })
  subscriberUserId?: string;

  @Field({ nullable: true })
  subscriberUserName?: string;

  @Field()
  createdAt: string;
}