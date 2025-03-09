import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppTestModule } from './app-test.module';
import 'dotenv/config'

async function bootstrap() {
  const port = 3795
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppTestModule, {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port },
  });
  await app.listen();
  console.log(`Service B (TCP) is listening on port ${port}`);
}
bootstrap();
