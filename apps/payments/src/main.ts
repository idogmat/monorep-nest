import { NestFactory } from '@nestjs/core';
import { applyAppSettings } from './settings/main.settings';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';
import express from 'express'
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { port, env, host, rabbit, grpc_url } = applyAppSettings(app)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'payments',
      protoPath: join(__dirname, 'payments.proto'),
      url: grpc_url,
      loader: {
        includeDirs: ['node_modules/google-proto-files'],
      },
    },
  });
  console.log('gRPC microservice connected');
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: [rabbit],
  //     queue: 'payments_queue',
  //     queueOptions: { durable: true },
  //   },
  // });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbit],
      queue: 'delay_payments_queue',
      queueOptions: { durable: true },
    },
  });
  console.log('RabbitMQ microservice connected');

  app.use(cookieParser());
  await app.init()

  // app.enableCors({
  //   origin: '*',
  //   credentials: true
  // });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.startAllMicroservices();

  console.log(`Service is listening on port ${port} , on ${env}  mode`);


}
bootstrap();
