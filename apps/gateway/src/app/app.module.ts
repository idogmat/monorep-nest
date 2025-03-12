import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersAccountsModule } from '../feature/user-accounts/users.accounts.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getConfiguration } from '../settings/getConfiguration';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaService } from '../feature/prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfiguration]
    }),
    CqrsModule,
    ThrottlerModule.forRoot([{
      ttl: 10000,
      limit: 5,
    }]),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'TCP_SERVICE',
        useFactory: (configService: ConfigService) => {
          console.log(configService.get('FILES_TCP'));
          console.log(configService.get('CONNECT_PORT'));
          return {
            transport: Transport.TCP,
            options: {
              host: configService.get('FILES_TCP'),
              port: configService.get('CONNECT_PORT'),  // Порт, на который отправляется запрос в Service B
              // host: 'app-test-service',
              // port: 3795,  // Порт, на который отправляется запрос в Service B
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    UsersAccountsModule,

  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
