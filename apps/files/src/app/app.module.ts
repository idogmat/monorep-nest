// src/app.module.ts
import { Module } from '@nestjs/common';
import { FilesController } from '../features/files/api/files.controller';
import {  ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getConfiguration } from '../../../gateway/src/settings/getConfiguration';
import { CqrsModule } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../common/s3/s3.storage.adapter';
import { MongooseModule } from '@nestjs/mongoose';
import { Configuration } from '@nestjs/cli/lib/configuration';
import { FilesService } from '../features/files/application/files.service';
import { AppController } from './app.controller';
import { FileModule } from '../features/file.module';

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
export class AppModule {}
