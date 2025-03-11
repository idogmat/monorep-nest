import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class VerifyEmailToken {
  @ApiProperty({ type: String })
  @IsString()
  token: string
}

export class EmailVerify {
  @ApiProperty({ type: String })
  @IsEmail()
  email: string;
}

export class EmailRecovery {
  @ApiProperty({ type: String })
  @IsEmail()
  email: string;

  @IsString()
  recaptchaToken: string
}
