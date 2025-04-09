import { PagedResponse } from '../../../../../common/pagination/paged.response';
import { ApiProperty } from '@nestjs/swagger';
import { UserProfileResponseDto } from '../../swagger.discription.ts';

export class PagedResponseOfProfiles extends PagedResponse<UserProfileResponseDto> {
  @ApiProperty({ type: UserProfileResponseDto, isArray: true })
  items: UserProfileResponseDto[];
}