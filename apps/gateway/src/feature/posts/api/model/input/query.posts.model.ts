import { Pagination } from '../../../../../common/pagination';
import { PaginationPostQueryDto } from './pagination.post.query.dto';

export class PaginationSearchPostTerm extends Pagination {
  public readonly description: string | null;
  public readonly userId: string | null;

  constructor(query: PaginationPostQueryDto, sortProperties: string[]) {
    super(query, sortProperties);

    this.description = query?.description ? query.description.toString() : null;
    this.userId = query?.userId ? query.userId.toString() : null;

  }
}