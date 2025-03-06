import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsOptional } from 'class-validator';

//Объединение декораторов
export const IsOptionalEmail = () =>
  applyDecorators(IsEmail(), IsOptional());
