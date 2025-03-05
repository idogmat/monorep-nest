import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppTestModule } from './app-test.module';
import 'dotenv/config'

async function bootstrap() {
  const host = process.env.TEST_HOST || '127.0.0.1';
  const port: number = +process.env.PORT || 3001;
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppTestModule, {
    transport: Transport.TCP,
    options: { host, port},
  });
  await app.listen();
  console.log(`Service B (TCP) is listening on port ${port}`);
}
bootstrap();
