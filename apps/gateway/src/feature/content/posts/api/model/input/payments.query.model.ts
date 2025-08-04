import { Pagination } from "../../../../../../../../libs/common/pagination";
import { PaginationContentQueryDto } from "./pagination.query";


export class PaginationSearchContentTerm extends Pagination {

  constructor(query: PaginationContentQueryDto, sortProperties: string[]) {
    super(query, sortProperties);
  }
};