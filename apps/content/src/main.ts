import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { applyAppSettings } from './settings/main.settings';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { port, env, host, rabbit, grpc_url } = applyAppSettings(app)

  await app.init();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'content',
      protoPath: join(__dirname, 'content.proto'),
      url: grpc_url,
      loader: {
        includeDirs: ['node_modules/google-proto-files'],
      },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbit],
      queue: 'content_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();

  console.log(`Service Content is listening on port ${port} , on ${env} mode`);

}
bootstrap();