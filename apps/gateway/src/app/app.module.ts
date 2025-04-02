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
import { ProfileModule } from '../feature/profile/profile.module';
import { RedisModule } from '../support.modules/redis/redis.module';

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
    RedisModule,
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'TCP_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.TCP,
            options: {
              host: configService.get('FILES_TCP'),
              port: configService.get('CONNECT_PORT'),
            },
          };
        },
        inject: [ConfigService],
      },
      // {
      //   name: 'GATE-SERVICE',
      //   imports: [ConfigModule], // Импорт з
      //   useFactory: (configService: ConfigService) => ({
      //     transport: Transport.TCP,
      //     options: {
      //       host: 'gate-service', // Или IP-адрес сервера
      //       port: Number(configService.get('PROFILE_SERVICE_PORT')),
      //     },
      //   }),
      //   inject: [ConfigService]
      // }
    ]),
    UsersAccountsModule,
    PostsModule,
    ProfileModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
