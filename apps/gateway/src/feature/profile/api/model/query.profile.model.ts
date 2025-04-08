import { Pagination } from "../../../../../src/common/pagination";
import { PaginationProfileQueryDto } from "./pagination.profile.query.dto";


export class PaginationSearchProfileTerm extends Pagination {
  public readonly description: string | null;
  public readonly userId: string | null;

  constructor(query: PaginationProfileQueryDto, sortProperties: string[]) {
    super(query, sortProperties);

    this.description = query?.description ? query.description.toString() : null;
    this.userId = query?.userId ? query.userId.toString() : null;

  }
}