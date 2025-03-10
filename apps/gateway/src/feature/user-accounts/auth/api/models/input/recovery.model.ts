import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class RecoveryModel {
  @ApiProperty({ type: String })
  @IsString()
  recoveryCode: string;

  @ApiProperty({ type: String, minLength: 6, maxLength: 20 })
  @IsString()
  @Length(6, 20)
  password: string;
}