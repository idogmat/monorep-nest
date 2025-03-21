// src/app.module.ts
import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import {  ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule,  } from '@nestjs/config';
import { getConfiguration } from '../../../gateway/src/settings/getConfiguration';
import { CqrsModule } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../common/s3/s3.storage.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfiguration]
    }),
    CqrsModule,
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
  ],
  controllers: [FilesController],
  providers: [
    S3StorageAdapter
  ],
  exports: [S3StorageAdapter],
})
export class AppModule {}
