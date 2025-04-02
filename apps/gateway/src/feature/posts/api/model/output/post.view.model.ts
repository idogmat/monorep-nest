import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsString, IsUUID, Length } from 'class-validator';

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
  @IsArray()
  @IsString({ each: true })
  photoUrls: string[];

  @ApiProperty({ type: Date })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ type: Date })
  @IsDate()
  updatedAt: Date;
}
