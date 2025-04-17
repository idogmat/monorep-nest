import { Module } from "@nestjs/common";
import { PaymentsModule } from "../features/payments/payments.module";


@Module({
  imports: [
    PaymentsModule
  ],
  providers: [

  ],
  controllers: [],
})
export class AppModule { }
