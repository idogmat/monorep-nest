import { ApiProperty } from "@nestjs/swagger";

export class DeviceModel {
  @ApiProperty({ type: String, })
  id: string;
  @ApiProperty({ type: String })
  userId: string;
  @ApiProperty({ type: String || null })
  ip: string;
  @ApiProperty({ type: String || null })
  title: string;
  @ApiProperty({ type: String })
  updatedAt: Date;

}