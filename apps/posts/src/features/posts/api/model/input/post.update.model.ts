import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';


export class PostUpdateModel{
  @ApiProperty({ type: String })
  @IsString()
  @Length(0, 500)
  description: string;

}