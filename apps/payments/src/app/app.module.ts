import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../feature/users/users.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getConfiguration } from '../settings/getConfiguration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [getConfiguration]
    }),
    ClientsModule.registerAsync([
    {
      imports: [ConfigModule],
      name: 'TCP_SERVICE',
      useFactory: (configService: ConfigService) => {
        console.log(configService.get('HOST_TCP'));
        console.log(configService.get('CONNECT_PORT'));
        return {
          transport: Transport.TCP,
          options: {
            host: configService.get('HOST_TCP'),
            port: configService.get('CONNECT_PORT'),  // Порт, на который отправляется запрос в Service B
          },
        };
      },
      inject: [ConfigService],
    },
  ]),
    // ClientsModule.registerAsync([
    //   {
    //     name: 'TCP_SERVICE',
    //     transport: Transport.TCP,
    //     options: {
    //       host: '127.0.0.1',
    //       port: 3001,  // Порт, на который отправляется запрос в Service B
    //     },
    //   },
    // ]),
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
