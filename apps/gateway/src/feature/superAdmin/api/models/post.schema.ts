import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginatedPost {

  @Field(() => Int)
  totalCount: number;

  @Field(() => [Post])
  posts: Post[];
}

@ObjectType()
export class Post {
  @Field()
  id: string;

  @Field()
  description: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  userName: string;

  @Field()
  banned: boolean;

  @Field({ nullable: true })
  photoUrlProfile: string;

  @Field({ nullable: true })
  paymentAccount: boolean;

  @Field({ nullable: true })
  photoUploadStatus: string;

  @Field(() => [String])
  photoUrls: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

}