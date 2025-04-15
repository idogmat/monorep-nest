import { Injectable, Logger } from "@nestjs/common";


@Injectable()
export class PaymentCronServiceMock {
  private readonly logger = new Logger(PaymentCronServiceMock.name);
  constructor(

  ) { }
  async handleCron() {
  }

}