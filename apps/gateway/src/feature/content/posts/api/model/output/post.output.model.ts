import { ApiProperty } from '@nestjs/swagger';

export class PostUrlOutputModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  postId: string;
}

export class PostOutputModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  published: boolean;

  @ApiProperty()
  banned: boolean;

  @ApiProperty()
  photoUploadStatus: string;

  @ApiProperty({ type: [PostUrlOutputModel] })
  urls: PostUrlOutputModel[];
}
export class PostQueryOutputModel {
  @ApiProperty()
  pageNumber: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty({ type: [PostOutputModel] })
  items: PostOutputModel[];
}
