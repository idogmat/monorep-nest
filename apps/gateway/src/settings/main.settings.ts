import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvironmentsTypes } from './getConfiguration';
import { HttpExceptionFilter } from './exception-filter';
import { ConfigService } from '@nestjs/config';
// import { LoggingInterceptor } from '../utils/interceptors/logging.interceptor';

const APP_PREFIX = '/api/v1';

export const applyAppSettings = (app: INestApplication): { port: number; env: string } => {
  const { port, env } = getEnv(app)

  setAppPrefix(app, APP_PREFIX);

  setSwagger(app, APP_PREFIX);

  setAppPipes(app);

  setAppExceptionsFilters(app);
  return { port, env }
};

const getEnv = (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const env = configService.get<EnvironmentsTypes>('NODE_ENV');
  // const prefix = configService.get<string>('APP_PREFIX');
  return { port, env }
}

const setAppPrefix = (app: INestApplication, prefix: string) => {
  app.setGlobalPrefix(prefix);
};

const setSwagger = (app: INestApplication, prefix: string) => {
  // if (env !== EnvironmentMode.PRODUCTION) {
  const swaggerPath = prefix + '/swagger';

  const config = new DocumentBuilder()
    .setTitle('Myin-Gram')
    .setDescription('API for control in-gram')
    .setVersion('1.1')
    // .addBearerAuth()
    // .addCookieAuth()
    // .addBasicAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document, {
    customSiteTitle: 'Myin-Gram Swagger',
  });
  // }
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

const setAppExceptionsFilters = (app: INestApplication) => {
  app.useGlobalFilters(new HttpExceptionFilter());
};
