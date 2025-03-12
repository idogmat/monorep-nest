import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app/app.module';
import { applyAppSettings } from '../src/settings/main.settings';
import { AuthTestManager } from './utils/auth/auth.test.manager';
import { EmailService } from '../src/common/email/email.service';
import { EmailServiceMock } from './mock/email.service.mock';
import request from 'supertest';
import { userTestSeeder } from './utils/users/user.test.seeder';
import dotenv from 'dotenv';
import { PrismaService } from '../src/feature/prisma/prisma.service';
import { clearDatabase } from './utils/clear.database';
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  const globalPrefix = "/api/v1";
  let prisma: PrismaService;  // Служба Prisma


  beforeAll(async () =>{
    dotenv.config({ path: '.env.test' });
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useClass(EmailServiceMock)
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
      .get( globalPrefix+'/')
      .expect(200);

    expect(response.text).toBe('Hello World!');
  });

  it('auth/signup (POST) successful', async () => {
    //create new user DTO
    const createModel = userTestSeeder.createUserDTO();
    //send
    await authTestManager.registration(globalPrefix, createModel);

  });

});
