import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';


describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports:[
        ClientsModule.register([
          {
            name: 'TCP_SERVICE',
            transport: Transport.TCP,
            options: {
              host: '127.0.0.1',
              port: 3001,  // Порт, на который отправляется запрос в Service B
            },
          },
        ])
      ],
      controllers: [AppController],
      providers: [],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
