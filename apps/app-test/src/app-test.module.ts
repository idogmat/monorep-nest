import { Module } from '@nestjs/common';
import { AppTestController } from './app-test.controller';
import { AppTestService } from './app-test.service';

@Module({
  imports: [],
  controllers: [AppTestController],
  providers: [AppTestService],
})
export class AppTestModule {}
