import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GoogleTokenModel{
  @ApiProperty({ type: String })
  @IsString()
  token: string;
}