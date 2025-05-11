import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Profile } from "./profile.schema";
@ObjectType()
export class PaginatedPayments {
  @Field(() => [Payment])
  payments: Payment[];

  @Field()
  totalCount?: number;
}
export enum PaymentStatus {
  ACTIVE = 'ACTIVE',
  CANCEL = 'CANCEL',
  PENDING = 'PENDING',
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

  @Field(() => PaymentStatus || null)
  status: PaymentStatus;

  @Field(() => Int, { nullable: true })
  amount?: number;

  @Field({ nullable: true })
  createdAt: string;

  @Field({ nullable: true })
  expiresAt?: string;

  @Field({ nullable: true })
  deletedAt?: string;

  @Field(() => Profile, { nullable: true })
  profile?: Profile;
}