import { INestApplication } from '@nestjs/common';
import { UserCreateModel } from '../../../src/feature/user-accounts/auth/api/models/input/user.create.model';
import request from 'supertest';


export class AuthTestManager {
  readonly path: string = '/auth';

  constructor(protected readonly app: INestApplication) {
  }

  async registration(globalPrefix: string, createInputUser: UserCreateModel) {
    return request(this.app.getHttpServer())
      .post(globalPrefix+this.path + '/signup')
      .send(createInputUser)
      .expect(201);
  }
}