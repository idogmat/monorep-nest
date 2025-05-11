import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { EnvironmentsTypes } from './getConfiguration';
import { ConfigService } from '@nestjs/config';
// import { LoggingInterceptor } from '../utils/interceptors/logging.interceptor';

const APP_PREFIX = '/api/v1';

export const applyAppSettings = (app: INestApplication): {
  port: number;
  env: string;
  host: string;
  rabbit: string
} => {
  const { port, env, host, rabbit } = getEnv(app)
  setAppPrefix(app, APP_PREFIX);

  setAppPipes(app);

  return { port, env, host, rabbit }
};

const getEnv = (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const env = configService.get<EnvironmentsTypes>('NODE_ENV')
  const port = configService.get<number>('PORT') || configService.get<number>('FILE_LOCAL_PORT');
  const host = env !== 'DEVELOPMENT' ? '0.0.0.0' : 'localhost';
  const rabbit = configService.get<string>('RABBIT_URLS')?.toString() || '';
  return { port, env, host, rabbit }
}

const checkEnv = (envMode: string) => {
  return envMode !== 'DEVELOPMENT' ? 'PORT' : 'FILE_LOCAL_PORT'
}
const setAppPrefix = (app: INestApplication, prefix: string) => {
  app.setGlobalPrefix(prefix);
};

const setAppPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const customErrors = [];
        console.log(errors, 'pipe');
        errors.forEach((e) => {
          const constraintKeys = Object.keys(e.constraints);
          constraintKeys.forEach((cKey) => {
            const msg = e.constraints[cKey];
            customErrors.push({ field: e.property, message: msg });
          });
        });


        throw new BadRequestException(customErrors);
      },
    }),
  );
};
