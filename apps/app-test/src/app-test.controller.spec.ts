import { Test, TestingModule } from '@nestjs/testing';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppTestController } from './app-test.controller';


describe('AppController', () => {
  let appController: AppTestController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppTestController],
      providers: [],
    }).compile();

    appController = app.get<AppTestController>(AppTestController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
