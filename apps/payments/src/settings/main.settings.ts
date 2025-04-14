import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { EnvironmentsTypes } from './getConfiguration';
import { ConfigService } from '@nestjs/config';

const APP_PREFIX = '/api/v1';
export const applyAppSettings = (app: INestApplication): {
  port: number;
  env: string;
  host: string;
  rabbit: string;
} => {
  const { port, env, host, rabbit, } = getEnv(app)
  setAppPrefix(app, APP_PREFIX);
  setAppPipes(app);

  return { port, env, host, rabbit, }
};

const getEnv = (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const env = configService.get<EnvironmentsTypes>('NODE_ENV')
  const port = configService.get<number>('PORT') || configService.get<number>('PAYMENTS_LOCAL_PORT');
  const rabbit = configService.get<string>('RABBIT_URLS')?.toString() || '';
  // const grpc_url = configService.get<string>('PROFILE_GRPC_URL')?.toString() || '';
  const host = env !== 'DEVELOPMENT' ? '0.0.0.0' : 'localhost';
  return { port, env, host, rabbit }
}
const setAppPrefix = (app: INestApplication, prefix: string) => {
  app.setGlobalPrefix(prefix);
};
const checkEnv = (envMode: string) => {
  return envMode !== 'DEVELOPMENT' ? 'PORT' : 'PROFILE_LOCAL_PORT'
}


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
