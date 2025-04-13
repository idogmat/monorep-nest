import { ApiProperty } from "@nestjs/swagger";

export class PaymentUrlModel {
  @ApiProperty({ type: String })
  url: string
}