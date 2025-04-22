// src/app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getConfiguration } from '../../../gateway/src/settings/getConfiguration';
import { AppController } from './app.controller';
import { FileModule } from '../features/file.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfiguration]
    }),
    ClientsModule.registerAsync([  // Здесь правильно используется ClientsModule для регистрации микросервисов
      {
        name: 'TCP_SERVICE',  // Имя микросервиса
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.TCP,
            options: {
              host: configService.get<string>('FILES_TCP'),
              port: configService.get<number>('FILE_LOCAL_PORT'),
            },
          };
        },
      },
    ]),
    FileModule
  ],
  controllers: [AppController],
  providers: [],
  exports: [],
})
export class AppModule { }
