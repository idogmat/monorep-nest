import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginatedPost {

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  pagesCount: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => [Post])
  items: Post[];
}

@ObjectType()
export class Post {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  description: string;

  @Field()
  photoUploadStatus: string;

  @Field(() => [String])
  photoUrls: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

}