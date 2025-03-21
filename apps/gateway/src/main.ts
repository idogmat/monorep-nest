import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';

import { useContainer } from 'class-validator';
import { applyAppSettings } from './settings/main.settings';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // remove localhost after test

  app.enableCors({
    origin: [
      'https://myin-gram.ru',
      // 'http://localhost:5173',
      'https://localhost:3000'
    ],
    credentials: true
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const { port, env } = applyAppSettings(app)

  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
    console.log('ENV: ', env);
  });

}
bootstrap();
