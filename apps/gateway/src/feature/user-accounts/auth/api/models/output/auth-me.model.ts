import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";

export class AuthMeOutputModel {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  name: string;
  @ApiProperty({ type: String })
  email: string;
  @ApiProperty({ type: String })
  isConfirmed: boolean;
}


export const AuthMeOutputMapper = (u: User): AuthMeOutputModel => {

  const outputModel = new AuthMeOutputModel();
  outputModel.id = u.id;
  outputModel.name = u.name;
  outputModel.email = u.email;
  outputModel.isConfirmed = u.isConfirmed

  return outputModel;
};