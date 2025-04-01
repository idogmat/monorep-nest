import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';


export class PostCreateModel{
  @ApiProperty({ type: String })
  @IsString()
  @Length(0, 500)
  description: string;

}