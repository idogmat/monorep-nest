import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { applyAppSettings } from './settings/main.settings';
import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  // const port = 3796
  const app = await NestFactory.create<INestApplication>(AppModule)
  const { port, env, host, rabbit } = applyAppSettings(app)

  // Настроим микросервисный транспорт для RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbit], // Подключение к RabbitMQ
      queue: 'file_queue', // Очередь, в которую будут отправляться сообщения
      queueOptions: { durable: false }, // Очередь не сохраняет сообщения после перезапуска
    },
  });
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.TCP,
  //   options: {
  //     host: host,
  //     port: port,
  //   },
  // });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.startAllMicroservices();
  await app.listen(port);

  console.log(`Service is listening on port ${port} , on ${env} mode`);
}
bootstrap();
