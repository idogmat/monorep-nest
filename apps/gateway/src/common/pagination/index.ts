import { PaginationPostQueryDto } from '../../feature/posts/api/model/input/pagination.post.query.dto';
import { PaginationBaseDto } from './pagination.base.dto';
import { PaginationProfileQueryDto } from '../../../../profile/src/features/model/pagination.profile.query.dto';

export type SortDirectionType = "DESC" | "ASC";

export class Pagination {
  public readonly pageNumber: number;
  public readonly pageSize: number;
  public readonly sortDirection: SortDirectionType;
  public readonly sortBy: string;

  constructor(query: PaginationBaseDto, sortProperties: string[] | []) {
    this.sortBy = this.getSortBy(query, sortProperties);
    this.sortDirection = this.getSortDirection(query);
    this.pageNumber = query?.pageNumber ? Number(query.pageNumber) : 1;
    this.pageSize = query?.pageSize ? Number(query.pageSize) : 10;
  }

  public getSkipItemsCount() {
    return (this.pageNumber - 1) * this.pageSize;
  }

  private getSortDirection(query: PaginationBaseDto): SortDirectionType {
    if (!query) return "DESC";
    let sortDirection: SortDirectionType = "DESC";

    switch (query.sortDirection) {
      case "desc": {
        sortDirection = "DESC";
        break;
      }
      case "asc": {
        sortDirection = "ASC";
        break;
      }
    }
    return sortDirection;
  }

  private getSortBy(query: PaginationBaseDto, sortProperties: string[]): string {

    if (!query) return "createdAt";

    let result = "createdAt";

    const querySortBy = query.sortBy;

    if (querySortBy === undefined) {
      return result;
    }

    // If query property sent as Array
    if (Array.isArray(querySortBy)) {

      for (let i: number = 0; i < querySortBy.length; i++) {
        const param = querySortBy[i];

        if (sortProperties.includes(param.toString())) {
          result = param.toString();
          break;
        }
      }
    } else {
      if (sortProperties.includes(querySortBy.toString())) {
        result = querySortBy.toString();
      }
    }

    return result;
  }
}

export class PaginationSearchUserTerm extends Pagination {
  public readonly name: string | null;
  public readonly email: string | null;
  constructor(query: PaginationProfileQueryDto, sortProperties: string[]) {
    super(query, sortProperties);

    this.name = query.name?.toString() || null;
    this.email = query.email?.toString() || null;

  }
}
