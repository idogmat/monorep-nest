import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DeleteUserResult {
  @Field()
  id: string;
}