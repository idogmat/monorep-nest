import { NestFactory } from '@nestjs/core';
import { applyAppSettings } from './settings/main.settings';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { port, env, host, rabbit } = applyAppSettings(app)

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.GRPC,
  //   options: {
  //     package: 'payments',
  //     protoPath: join(__dirname, 'payments.proto'),
  //     url: grpc_url,
  //     loader: {
  //       includeDirs: ['node_modules/google-proto-files'],
  //     },
  //   },
  // });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbit],
      queue: 'payments_queue',
      queueOptions: { durable: false },
    },
  });

  // Запускаем все микросервисы
  await app.startAllMicroservices();

  await app.listen(port);

  console.log(`Service is listening on port ${port} , on ${env} mode`);
}
bootstrap();
