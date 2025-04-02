import { ParsedQs } from 'qs';
import { Pagination } from '../../../../../common/pagination';

export class PaginationSearchPostTerm extends Pagination {
  public readonly description: string | null;

  constructor(query: ParsedQs, sortProperties: string[]) {
    super(query, sortProperties);

    this.description = query?.description ? query.description.toString() : null;

  }
}