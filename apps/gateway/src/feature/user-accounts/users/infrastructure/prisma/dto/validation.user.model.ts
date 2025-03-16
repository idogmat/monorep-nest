import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator";
import { ParsedQs } from "qs";

export class ValidationUserModel {
  @ApiProperty({ type: String, nullable: true, required: false })
  @IsString()
  name: any
  @ApiProperty({ type: String, nullable: true, required: false })
  @IsString()
  email: any
}