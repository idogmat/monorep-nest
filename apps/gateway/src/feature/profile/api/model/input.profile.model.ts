import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class InputProfileModel {
  @ApiProperty({ type: String })
  @IsString()
  firstName: string

  @ApiProperty({ type: String })
  @IsString()
  lastName: string

  @ApiProperty({ type: String })
  @IsString()
  userName: string

  @ApiProperty({ type: String })
  @IsString()
  aboutMe: string

}

