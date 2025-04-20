import { Pagination } from './index';
import { PaginationPostQueryDto } from '../../../posts/src/features/posts/api/model/input/pagination.post.query.dto';

export class PaginationSearchPostTerm extends Pagination {
  public readonly description: string | null;
  public readonly userId: string | null;

  constructor(query: PaginationPostQueryDto, sortProperties: string[]) {
    super(query, sortProperties);

    this.description = query?.description ? query.description.toString() : null;
    this.userId = query?.userId ? query.userId.toString() : null;

  }

  public toQueryParams(): Record<string, string> {
    const entries = Object.entries(this)
      .filter(([_, value]) => value !== null && value !== undefined)
      .reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>);

    return entries;
  }
}