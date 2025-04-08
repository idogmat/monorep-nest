import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationBaseDto } from '../../../../../common/pagination/pagination.base.dto';
import { IsOptional, IsString } from 'class-validator';

export class PaginationProfileQueryDto extends PaginationBaseDto {

  @ApiPropertyOptional({ example: 'Jack', description: 'Поиск по userName' })
  @IsOptional()
  @IsString()
  userName?: string;

}