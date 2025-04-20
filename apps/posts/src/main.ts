import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { json, urlencoded } from 'express';
import { useContainer } from 'class-validator';
import { applyAppSettings } from './settings/main.settings';


async function bootstrap() {
  const app = await NestFactory.create<INestApplication>(AppModule);
  const { port, env, host, rabbit } = applyAppSettings(app)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbit],
      queue: 'post_queue',
      queueOptions: { durable: false },
    },
  });

  app.use(json({ limit: '10gb' }));
  app.use(urlencoded({ extended: true, limit: '10gb' }));

  await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: host,
      port: port,
    },
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.init();
  await app.startAllMicroservices();

  await app.listen(port);
  console.log(`Service  is listening on port ${port} , on ${env} mode`);
}
bootstrap();
