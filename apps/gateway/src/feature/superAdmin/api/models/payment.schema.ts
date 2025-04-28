import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Profile } from "./profile.schema";
@ObjectType()
export class PaginatedPayments {
  @Field(() => [Payment])
  users: Payment[];

  @Field()
  totalCount?: number;
}
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
});

@ObjectType()
export class Payment {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  subscriptionId?: string;

  @Field()
  customerId: string;

  @Field({ nullable: true })
  payType?: string;

  @Field({ nullable: true })
  subType?: string;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field(() => Int, { nullable: true })
  amount?: number;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  deletedAt?: Date;

  @Field(() => Profile, { nullable: true })
  profile?: Profile;
}