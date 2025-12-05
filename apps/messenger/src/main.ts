import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { json, urlencoded } from 'express';
import { useContainer } from 'class-validator';
import { applyAppSettings } from './settings/main.settings';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.create<INestApplication>(AppModule);
  const { port, env, host, rabbit, grpc_url } = applyAppSettings(app)

  app.use(json({ limit: '10gb' }));
  app.use(urlencoded({ extended: true, limit: '10gb' }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'messenger',
      protoPath: join(__dirname, 'messenger.proto'),
      url: grpc_url,
      loader: {
        includeDirs: ['node_modules/google-proto-files'],
      },
    },
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.init();
  await app.startAllMicroservices();

  await app.listen(port);
  console.log(`Service  is listening on port ${port} , on ${env} mode`);
}
bootstrap();
