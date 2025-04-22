import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class PaginationBaseDto {
  @ApiPropertyOptional({ example: '1', description: 'Номер страницы' })
  @IsOptional()
  @IsNumberString()
  pageNumber?: string = '1';

  @ApiPropertyOptional({ example: '10', description: 'Размер страницы' })
  @IsOptional()
  @IsNumberString()
  pageSize?: string = '10';

  @ApiPropertyOptional({ example: 'createdAt', description: 'Поле сортировки' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    example: 'DESC',
    enum: ['ASC', 'DESC', 'asc', 'desc'],
    description: 'Направление сортировки'
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortDirection?: string = 'DESC';
}