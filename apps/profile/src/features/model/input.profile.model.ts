import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class InputProfileModel {

  firstName: string

  lastName: string

  userName: string

  aboutMe: string

}

