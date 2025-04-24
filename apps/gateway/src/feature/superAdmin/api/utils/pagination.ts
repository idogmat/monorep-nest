export type SortDirectionType = "desc" | "asc";

export class PaginationGqlDto {
  offset?: number = 1;
  limit?: number = 10;
  sortBy?: string = 'createdAt';
  sortDirection?: string = 'desc';
}

export class Pagination {
  public readonly offset: number;
  public readonly limit: number;
  public readonly sortDirection: SortDirectionType;
  public readonly sortBy: string;

  constructor(params: PaginationGqlDto, sortProperties: string[] | []) {
    this.sortBy = this.getSortBy(params, sortProperties);
    this.sortDirection = this.getSortDirection(params);
    this.offset = params?.offset ? Number(params.offset) : 0;
    this.limit = params?.limit ? Number(params.limit) : 10;
  }

  private getSortDirection(params: PaginationGqlDto): SortDirectionType {
    if (!params) return "desc";
    let sortDirection: SortDirectionType = "desc";

    switch (params.sortDirection?.toLocaleLowerCase()) {
      case "desc": {
        sortDirection = "desc";
        break;
      }
      case "asc": {
        sortDirection = "asc";
        break;
      }
      default: {
        sortDirection = "desc";
        break;
      }
    }
    return sortDirection;
  }

  private getSortBy(query: PaginationGqlDto, sortProperties: string[]): string {

    if (!query) return "createdAt";

    let result = "createdAt";

    const querySortBy = query.sortBy;

    if (querySortBy === undefined) {
      return result;
    }

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



export class PaginationUserQueryDto extends PaginationGqlDto {

  name?: string;
}

export class PaginationSearchUserGqlTerm extends Pagination {
  public readonly name: string | null;

  constructor(query: PaginationUserQueryDto, sortProperties: string[]) {
    super(query, sortProperties);

    this.name = query?.name ? query.name.toString() : null;

  }
}