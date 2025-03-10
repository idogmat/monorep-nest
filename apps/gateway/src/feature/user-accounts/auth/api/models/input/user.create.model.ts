import { IsString, Length } from 'class-validator';
import { IsOptionalEmail } from '../../../../../../infrastructure/decorators/validate/is.optional.email';
import { ApiProperty } from '@nestjs/swagger';

export class UserCreateModel {
  @ApiProperty({ type: String })
  @IsString()
  @Length(6, 30, { message: 'Login is not correct' })
  login: string;

  @ApiProperty({ type: String })
  @Length(6, 20, { message: 'Password is not correct' })
  password: string;

  @ApiProperty({ type: String })
  @IsOptionalEmail()
  email: string;
}