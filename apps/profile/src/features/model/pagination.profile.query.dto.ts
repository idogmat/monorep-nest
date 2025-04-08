import { ApiPropertyOptional } from '@nestjs/swagger';
import {  IsOptional, IsString } from 'class-validator';
import { PaginationBaseDto } from '../../../../gateway/src/common/pagination/pagination.base.dto';


export class PaginationProfileQueryDto extends PaginationBaseDto{

  @ApiPropertyOptional({ example: 'Пост', description: 'Поиск по name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'dfsfdsf@gmail.com', description: 'Поиск по email' })
  @IsOptional()
  @IsString()
  email?: string;
}