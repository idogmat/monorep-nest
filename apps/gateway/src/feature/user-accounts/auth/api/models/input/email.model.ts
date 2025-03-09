import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class VerifyEmailToken {
  @ApiProperty({ type: String })
  @IsString()
  token: string
}

export class EmailRecovery {

  @IsEmail()
  email: string;

}