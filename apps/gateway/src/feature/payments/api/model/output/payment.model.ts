import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber, IsString, IsUUID } from 'class-validator';
import { PaymentStatus } from '../../../../../../prisma/generated/client';

export class PaymentsViewModel {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  id: string;

  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ type: String })
  @IsString()
  subscriptionId: string;

  @ApiProperty({ type: String })
  @IsDate()
  createdAt: string;

  @ApiProperty({ type: String || null })
  @IsDate()
  expiresAt: string;

  @ApiProperty({ type: String || null })
  @IsDate()
  deletedAt: string;

  @ApiProperty({ type: String })
  @IsString()
  payType: string;

  @ApiProperty({ type: String })
  @IsString()
  subType: string;

  @ApiProperty({ enum: PaymentStatus })
  @IsEnum(PaymentStatus, { message: 'CANCEL, PENDING or ACTIVE' })
  status: PaymentStatus;

  @ApiProperty({ type: Number })
  @IsNumber()
  amount: number;

}