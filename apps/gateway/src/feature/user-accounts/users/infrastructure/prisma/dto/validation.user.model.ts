import { ApiProperty } from "@nestjs/swagger"


export class ValidationUserModel {
  @ApiProperty({ type: String, nullable: true, required: false })
  name: string | undefined
  @ApiProperty({ type: String, nullable: true, required: false })
  email: string | undefined
}