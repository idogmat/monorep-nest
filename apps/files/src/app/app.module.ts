// src/app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getConfiguration } from '../../../gateway/src/settings/getConfiguration';
import { AppController } from './app.controller';
import { FileModule } from '../features/file.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfiguration]
    }),
    ClientsModule.register([  // Здесь правильно используется ClientsModule для регистрации микросервисов
      {
        name: 'TCP_SERVICE',  // Имя микросервиса
        transport: Transport.TCP,  // Тип транспорта
        options: {
          host: 'localhost',
          port: 3795,  // Порт, на котором работает микросервис `files`
        },
      },
    ]),
    FileModule
  ],
  controllers: [AppController,],
  providers: [],
  exports: [],
})
export class AppModule { }
