import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class LoginModel {
  @ApiProperty({ type: String })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ type: String, minLength: 6, maxLength: 20 })
  @IsString()
  @Length(6, 20)
  password: string;
}