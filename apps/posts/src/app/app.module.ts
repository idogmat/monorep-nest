// src/app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getConfiguration } from '../../../gateway/src/settings/getConfiguration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostModule } from '../features/posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfiguration]
    }),
    ClientsModule.registerAsync([  // Здесь правильно используется ClientsModule для регистрации микросервисов
      {
        name: 'TCP_SERVICE',  // Имя микросервиса
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.TCP,
            options: {
              host: configService.get<string>('POST_TCP'),
              port: configService.get<number>('POST_LOCAL_PORT'),
            },
          };
        },
      },
    ]),
    PostModule
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule { }
