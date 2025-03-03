import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppTestModule } from './app-test.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppTestModule, {
    transport: Transport.TCP,
    options: { host: '127.0.0.1', port: 3001 },
  });
  await app.listen();
  console.log('Service B (TCP) is listening on port 3001');
}
bootstrap();
