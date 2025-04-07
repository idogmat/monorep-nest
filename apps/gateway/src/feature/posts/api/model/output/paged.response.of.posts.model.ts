import { PagedResponse } from '../../../../../common/pagination/paged.response';
import { PostViewModel } from './post.view.model';
import { ApiProperty } from '@nestjs/swagger';

export class PagedResponseOfPosts extends PagedResponse<PostViewModel> {
  @ApiProperty({ type: PostViewModel, isArray: true })
  items: PostViewModel[];
}