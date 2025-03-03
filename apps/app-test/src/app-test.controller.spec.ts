import { Test, TestingModule } from '@nestjs/testing';
import { AppTestController } from './app-test.controller';
import { AppTestService } from './app-test.service';

describe('AppTestController', () => {
  let appTestController: AppTestController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppTestController],
      providers: [AppTestService],
    }).compile();

    appTestController = app.get<AppTestController>(AppTestController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appTestController.getHello()).toBe('Hello World!');
    });
  });
});
