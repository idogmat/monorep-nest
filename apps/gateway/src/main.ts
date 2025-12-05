import 'newrelic';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { useContainer } from 'class-validator';
import { applyAppSettings } from './settings/main.settings';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(cookieParser());

  // remove localhost after test

  app.enableCors({
    origin: [
      'https://myin-gram.ru',
      'http://localhost:5173',
      'https://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3000'
    ],
    credentials: true
  });
  const { port, env, rabbit } = applyAppSettings(app)

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: [rabbit],
  //     queue: 'profile_queue',
  //     queueOptions: { durable: true },
  //   },
  // });


  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbit],
      queue: 'payments_notification_queue',
      queueOptions: { durable: true },
      noAck: false
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbit],
      queue: 'messenger_queue',
      queueOptions: { durable: true },
      noAck: false
    },
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.init();
  await app.startAllMicroservices();

  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
    console.log('ENV: ', env);
    // intervalRunner.start(() => console.log(process.memoryUsage()), 5000, true)
    // intervalRunner.start(() => console.log(v8.getHeapStatistics()), 5000, true)
  });

}
bootstrap();
