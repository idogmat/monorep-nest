import { PostViewModel } from './post.view.model';
import { ApiProperty } from '@nestjs/swagger';
import { PagedResponse } from '../../../../../../../libs/common/pagination/paged.response';

export class PagedResponseOfPosts extends PagedResponse<PostViewModel> {
  @ApiProperty({ type: PostViewModel, isArray: true })
  items: PostViewModel[];
}