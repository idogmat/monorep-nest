import { IsString, IsUUID } from "class-validator";

export class ProfilePhotoInputModel {
  @IsUUID()
  userId: string;

  @IsString()
  photoUrl: string;
}