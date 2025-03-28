import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';

import { useContainer } from 'class-validator';
import { applyAppSettings } from './settings/main.settings';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // remove localhost after test

  app.enableCors({
    origin: [
      'https://myin-gram.ru',
      'http://localhost:5173',
      'https://localhost:3000'
    ],
    credentials: true
  });
  const { port, env, rabbit } = applyAppSettings(app)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbit], // Подключение к RabbitMQ
      queue: 'file_queue', // Очередь, в которую будут отправляться сообщения
      queueOptions: { durable: false }, // Очередь не сохраняет сообщения после перезапуска
    },
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });


  await app.startAllMicroservices();
  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
    console.log('ENV: ', env);
  });

}
bootstrap();
