import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GithubTokenModel {
  @ApiProperty({ type: String })
  @IsString()
  code: string;
}