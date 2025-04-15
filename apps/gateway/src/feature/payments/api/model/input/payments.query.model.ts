import { Pagination } from "../../../../../common/pagination";
import { PaginationPaymentsQueryDto } from "./pagination.query";


export class PaginationSearchPaymentsTerm extends Pagination {

  constructor(query: PaginationPaymentsQueryDto, sortProperties: string[]) {
    super(query, sortProperties);
  }
}