import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class InputCommentModel {

  @ApiProperty({ type: String })
  @Length(6, 300, { message: 'content is not correct' })
  @IsString()
  content: string

  swagger() {

    this.content = 'string'

    return this
  }

}
