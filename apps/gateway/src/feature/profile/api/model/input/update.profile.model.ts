import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateProfileModel {
  @ApiProperty({
    required: false,
    description: 'Username пользователя',
    example: 'ivan_ivanov',
  })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiProperty({
    required: false,
    description: 'Имя пользователя',
    example: 'Иван',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    required: false,
    description: 'Фамилия пользователя',
    example: 'Иванов',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    required: false,
    description: 'Дата рождения в формате ISO',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({
    required: false,
    description: 'Страна проживания',
    example: 'Россия',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    required: false,
    description: 'Город проживания',
    example: 'Москва',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    required: false,
    description: 'Информация о пользователе',
    example: 'Разработчик backend на Node.js',
  })
  @IsOptional()
  @IsString()
  aboutMe?: string;
}