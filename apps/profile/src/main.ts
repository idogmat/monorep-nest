import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { applyAppSettings } from './settings/main.settings';
import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<INestApplication>(AppModule)
  const { port, env, host, rabbit } = applyAppSettings(app)

  // Настроим микросервисный транспорт для RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbit], // Подключение к RabbitMQ
      queue: 'profile_queue', // Очередь, в которую будут отправляться сообщения
      queueOptions: { durable: false }, // Очередь не сохраняет сообщения после перезапуска
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'message',
      protoPath: join(__dirname, 'proto/message.proto'),
      url: '0.0.0.0:3814', // Слушаем все интерфейсы

    },
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.startAllMicroservices();
  await app.listen(port);

  console.log(`Service is listening on port ${port} , on ${env} mode`);
}
bootstrap();
