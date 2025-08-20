import { Test, TestingModule } from '@nestjs/testing';
import { Global, INestApplication, Module } from '@nestjs/common';
import { AppModule } from '../src/app/app.module';
import { applyAppSettings } from '../src/settings/main.settings';
import { AuthTestManager } from './utils/auth/auth.test.manager';
import { EmailService } from '../src/common/email/email.service';
import { EmailServiceMock } from './mock/email.service.mock';
import request from 'supertest';
import dotenv from 'dotenv';
import { PrismaService } from '../src/feature/prisma/prisma.service';
import { clearDatabase } from './utils/clear.database';
import { GateService } from '../src/common/gate.service';
import { GateServiceMock } from './mock/gate.service.mock';
import { GrpcServiceModule } from '../src/support.modules/grpc/grpc.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ProfileClientService } from '../src/support.modules/grpc/grpc.profile.service';
import { StripeAdapterMock } from './mock/stripe.adapter.mok';
import { PaymentsClientService } from '../src/support.modules/grpc/grpc.payments.service';
import { ContentClientService } from '../src/support.modules/grpc/grpc.content.service';
import { FilesClientService } from '../src/support.modules/grpc/grpc.files.service';
import { SendFileService } from '../src/support.modules/file/file.service';
import { FileServiceModule } from '../src/support.modules/file/file.module';
import { ConfigService } from 'aws-sdk';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PROFILE_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'profile',
          protoPath: join(__dirname, '../../libs/proto/profile.proto'),
          url: '0.0.0.0',
        },
      },
      {
        name: 'PAYMENTS_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'payments',
          protoPath: join(__dirname, '../../libs/proto/payments.proto'),
          url: '0.0.0.0',
        },
      },
      {
        name: 'CONTENT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'content',
          protoPath: join(__dirname, '../../libs/proto/content.proto'),
          url: '0.0.0.0',
        },
      },
      {
        name: 'FILES_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'files',
          protoPath: join(__dirname, '../../libs/proto/files.proto'),
          url: '0.0.0.0',
        },
      },
    ]),
  ],
  controllers: [],
  providers: [
    ProfileClientService,
    PaymentsClientService,
    ContentClientService,
    FilesClientService
  ],
  exports: [
    ProfileClientService,
    PaymentsClientService,
    ContentClientService,
    FilesClientService
  ],
})
export class GrpcServiceModuleMock { }

export class SendFileServiceMock { }
@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [{
    provide: 'SEND_FILE_SERVICE',
    useFactory: () => {
      return new SendFileServiceMock();
    },
    inject: [],
  }],
  exports: ['SEND_FILE_SERVICE'],
})
export class FileServiceModuleMock { }
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  const globalPrefix = "/api/v1";
  let prisma: PrismaService;  // Служба Prisma


  beforeAll(async () => {
    dotenv.config({ path: '.env.test' });
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useClass(EmailServiceMock)
      .overrideProvider(GateService)
      .useClass(GateServiceMock)
      .overrideProvider('STRIPE_ADAPTER')
      .useClass(StripeAdapterMock)
      .overrideModule(GrpcServiceModule)
      .useModule(GrpcServiceModuleMock)
      .overrideModule(FileServiceModule)
      .useModule(FileServiceModuleMock)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);
    applyAppSettings(app);
    await app.init();

    authTestManager = new AuthTestManager(app);
  })

  beforeEach(async () => {

    await clearDatabase(prisma);
  });
  it('/ (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get(globalPrefix + '/')
      .expect(200);

    expect(response.text).toBe('Hello World!');
  });

  // it('auth/signup (POST) successful', async () => {
  //   //create new user DTO
  //   const createModel = userTestSeeder.createUserDTO();
  //   //send
  //   await authTestManager.registration(globalPrefix, createModel);

  // });
  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

});
