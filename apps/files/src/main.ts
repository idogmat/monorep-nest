import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import 'dotenv/config'
import { AppModule } from './app/app.module';

async function bootstrap() {
  const port = 3795
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: { host: 'localhost', port },
  });
  await app.listen();
  console.log(`Service B (TCP) is listening on port ${port}`);
}
bootstrap();
