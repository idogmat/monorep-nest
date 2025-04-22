import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { $Enums } from '../../../../../../prisma/generated/post-client';
import PhotoUploadStatus = $Enums.PhotoUploadStatus;


export class PostViewModel {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  id: string;

  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ type: String })
  @IsString()
  @Length(0, 500)
  description: string;

  @ApiProperty({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];

  @ApiProperty({ type: String })
  @IsDate()
  createdAt: string;

  @ApiProperty({ type: String })
  @IsDate()
  updatedAt: string;

  @ApiProperty({
    enum: PhotoUploadStatus,
    description: 'Статус загрузки фотографий',
    example: PhotoUploadStatus.PENDING
  })

  @IsEnum(PhotoUploadStatus)
  photoUploadStatus: PhotoUploadStatus;
}
