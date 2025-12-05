import { Pagination } from "../../../../../../../../libs/common/pagination";
import { PaginationContentQueryDto } from "./pagination.query";


export class PaginationSearchContentTerm extends Pagination {
  userId: string | null;

  constructor(query: PaginationContentQueryDto, sortProperties: string[]) {
    super(query, sortProperties);
    this.userId = query?.userId ? query.userId.toString() : null;
  }
};