import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsString } from "class-validator";

export class SubscribeProductDto {
  @ApiProperty({
    description: 'Subscribe type 1 = 10$, 2 = 50$, 3 = 100$',
    enum: [1, 2, 3],
    example: 1,
  })
  @IsIn([1, 2, 3], { message: 'subscribeType should be 1, 2 or 3' })
  subscribeType: 1 | 2 | 3;
}

export class SubscribeDto {
  @ApiProperty({
    description: 'Subscribe id',
  })
  @IsString()
  paymentId: string;
}