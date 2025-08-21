import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';


export class PostCreateModel {
  @ApiProperty({
    description: 'Post description text',
    example: 'This is my awesome post!',
    required: true,
  })
  @IsString()
  @Length(0, 500)
  description: string;

  swagger() {

    this.description = 'string'

    return this
  }

}