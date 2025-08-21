import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';


export class CommentCreateModel {
  @ApiProperty({
    description: 'Comment message text',
    example: 'This is my awesome comment!',
    required: true,
  })
  @IsString()
  @Length(0, 500)
  message: string;

}