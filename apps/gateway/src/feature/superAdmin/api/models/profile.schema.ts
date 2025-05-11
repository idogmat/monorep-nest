import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Profile {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  photoUrl?: string;

  @Field()
  paymentAccount: boolean;

  @Field()
  userName: string;

  @Field({ nullable: true })
  aboutMe?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  dateOfBirth?: Date;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  city?: string;

  @Field()
  createdAt: Date;
}