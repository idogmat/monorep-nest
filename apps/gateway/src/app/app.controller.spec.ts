import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GrpcServiceModule } from '../support.modules/grpc/grpc.module';
import { Module } from '@nestjs/common';
import { ProfileClientService } from '../support.modules/grpc/grpc.service';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PROFILE_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'profile',
          protoPath: join(__dirname, '../../../libs/proto/profile.proto'),
          url: '0.0.0.0',
        },
      },
    ]),
  ],
  controllers: [],
  providers: [ProfileClientService],
  exports: [ProfileClientService],
})
export class GrpcServiceModuleMock { }

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        GrpcServiceModule,
        ClientsModule.register([
          {
            name: 'TCP_SERVICE',
            transport: Transport.TCP,
            options: {
              host: '127.0.0.1',
              port: 3001,  // Порт, на который отправляется запрос в Service B
            },
          },
          // {
          //   name: 'MESSAGE_SERVICE',
          //   transport: Transport.GRPC,
          //   options: {
          //     package: 'message',
          //     protoPath: join(__dirname, '../proto/message.proto'),
          //     url: '0.0.0.0',
          //   },
          // }
        ])
      ],
      controllers: [AppController],
      providers: [],
    })
      .overrideModule(GrpcServiceModule)
      .useModule(GrpcServiceModuleMock)
      .compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
