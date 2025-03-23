import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { useContainer } from 'class-validator';
import { applyAppSettings } from './settings/main.settings';

async function bootstrap() {
  // const port = 3795
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule)
  const { port, env, host } = applyAppSettings(app)

  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: host,
      port: port,
    },
  });
  useContainer(microservice.select(AppModule), { fallbackOnErrors: true });

  await microservice.listen();
  console.log(`Service B (TCP) is listening on port ${port} , on ${env} mode`);
}
bootstrap();
