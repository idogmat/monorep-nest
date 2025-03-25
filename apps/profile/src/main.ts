import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { applyAppSettings } from './settings/main.settings';
import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  // const port = 3795
  const app = await NestFactory.create<INestApplication>(AppModule)
  const { port, env, host } = applyAppSettings(app)

  // Настроим микросервисный транспорт для RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://user:password@localhost:5672'], // Подключение к RabbitMQ
      queue: 'test_queue', // Очередь, в которую будут отправляться сообщения
      queueOptions: { durable: false }, // Очередь не сохраняет сообщения после перезапуска
    },
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.startAllMicroservices();
  await app.listen(port);

  console.log(`Service is listening on port ${port} , on ${env} mode`);
}
bootstrap();
