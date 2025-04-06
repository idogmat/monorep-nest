import { NestFactory } from '@nestjs/core';
import { applyAppSettings } from './settings/main.settings';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { port, env, host, rabbit, grpc_url } = applyAppSettings(app)

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'profile',
      protoPath: join(__dirname, 'profile.proto'),
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
      queue: 'profile_queue',
      queueOptions: { durable: false },
    },
  });

  // Запускаем все микросервисы
  await app.startAllMicroservices();

  // await app.listen(port);

  console.log(`Service is listening on port ${port} , on ${env} mode`);
}
bootstrap();
