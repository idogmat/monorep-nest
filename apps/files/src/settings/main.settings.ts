import {
  BadRequestException,
  INestApplication,
  INestMicroservice,
  ValidationPipe,
} from '@nestjs/common';
import { EnvironmentsTypes } from './getConfiguration';
import { ConfigService } from '@nestjs/config';
// import { LoggingInterceptor } from '../utils/interceptors/logging.interceptor';

const APP_PREFIX = '/api/v1';

export const applyAppSettings = (app: INestApplication): {
  port: number;
  env: string;
  host: string
} => {
  const { port, env, host } = getEnv(app)
  setAppPrefix(app, APP_PREFIX);

  setAppPipes(app);

  return { port, env, host }
};

const getEnv = (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const env = configService.get<EnvironmentsTypes>('NODE_ENV')
  const port = configService.get<number>(checkEnv(env)) || 3000;
  const host = env !== 'DEVELOPMENT' ? '0.0.0.0' : 'localhost';
  // const rabbit = configService.get<string>('RABBIT_URLS');
  return { port, env, host }
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
