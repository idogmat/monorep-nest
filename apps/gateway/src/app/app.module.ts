import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersAccountsModule } from '../feature/user-accounts/users.accounts.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getConfiguration } from '../settings/getConfiguration';
import { CqrsModule } from '@nestjs/cqrs';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfiguration]
    }),
    CqrsModule,
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
            // host: configService.get('HOST_TCP'),
            // port: configService.get('CONNECT_PORT'),  // Порт, на который отправляется запрос в Service B
            host: 'app-test-service',
            port: 3783,  // Порт, на который отправляется запрос в Service B
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
    UsersAccountsModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
