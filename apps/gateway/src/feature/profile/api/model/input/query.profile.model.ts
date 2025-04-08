import { Pagination } from "../../../../../common/pagination";
import { PaginationProfileQueryDto } from "./pagination.profile.query.dto";


export class PaginationSearchProfileTerm extends Pagination {
  public readonly userName: string | null;

  constructor(query: PaginationProfileQueryDto, sortProperties: string[]) {
    super(query, sortProperties);

    this.userName = query?.userName ? query.userName.toString() : null;

  }
}