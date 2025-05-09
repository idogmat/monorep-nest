import { Field, ObjectType } from '@nestjs/graphql';
import { Profile } from './profile.schema';

@ObjectType()
export class PaginatedUsers {
  @Field(() => [User])
  users: User[];

  @Field()
  totalCount?: number;
}

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  confirmationCode?: string;

  @Field({ nullable: true })
  codeExpiration?: Date;

  @Field()
  isConfirmed: boolean;

  @Field({ nullable: true })
  recoveryCode?: string;

  @Field({ nullable: true })
  passwordHash?: string;

  @Field({ nullable: true })
  expirationDate?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt?: Date;

  @Field(() => Profile, { nullable: true })
  profile?: Profile;

  @Field()
  banned: boolean;
}