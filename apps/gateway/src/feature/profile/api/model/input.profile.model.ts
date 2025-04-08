import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class InputProfileModel {

  @ApiProperty({ type: String })
  @IsString()
  userName: string

  @ApiProperty({ type: String })
  @IsString()
  firstName: string

  @ApiProperty({ type: String })
  @IsString()
  lastName: string

  @ApiProperty({ type: String, default: '2025-04 -08T08: 57: 33.337Z' })
  @IsString()
  dateOfBirth: string

  @ApiProperty({ type: String })
  @IsString()
  country: string

  @ApiProperty({ type: String })
  @IsString()
  city: string

  @ApiProperty({ type: String })
  @IsString()
  aboutMe: string

  swagger() {

    this.userName = 'string'


    this.firstName = 'string'


    this.lastName = 'string'


    this.dateOfBirth = '2025-04 -08T08: 57: 33.337Z'


    this.country = 'string'


    this.city = 'string'


    this.aboutMe = 'string'

    return this
  }

}

