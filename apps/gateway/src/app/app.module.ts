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
import { PostsModule } from '../feature/posts/posts.module';

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
          return {
            transport: Transport.TCP,
            options: {
               host: configService.get('FILES_TCP'),
               port: configService.get('CONNECT_PORT'),  // Порт, на который отправляется запрос в Service B

            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    UsersAccountsModule,
    PostsModule

  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
