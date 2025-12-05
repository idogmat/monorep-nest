import { PaginationBaseDto } from "../../../../../../../../libs/common/pagination/pagination.base.dto";

export class PaginationContentQueryDto extends PaginationBaseDto {
  userId: string | null;
}