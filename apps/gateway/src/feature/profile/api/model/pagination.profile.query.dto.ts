import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationBaseDto } from '../../../../common/pagination/pagination.base.dto';
import { IsOptional, IsString } from 'class-validator';

export class PaginationProfileQueryDto extends PaginationBaseDto {

  @ApiPropertyOptional({ example: 'Пост', description: 'Поиск по description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Поиск по user id' })
  @IsOptional()
  @IsString()
  userId?: string;
}