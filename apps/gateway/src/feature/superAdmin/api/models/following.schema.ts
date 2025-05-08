import { Field, ObjectType } from "@nestjs/graphql";
import { } from "./profile.schema";
@ObjectType()
export class PaginatedFollowing {
  @Field(() => [Following])
  following: Following[];

  @Field()
  totalCount?: number;
}

@ObjectType()
export class Following {

  @Field({ nullable: true })
  subscriberId?: string;

  @Field({ nullable: true })
  profileId?: string;

  @Field({ nullable: true })
  profileUserId?: string;

  @Field({ nullable: true })
  subscriberUserId?: string;

  @Field({ nullable: true })
  profileUserName?: string;

  @Field()
  createdAt: string;
}