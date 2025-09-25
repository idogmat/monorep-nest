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
import { GrpcServiceModule } from '../support.modules/grpc/grpc.module';
import { PaymentsModule } from '../feature/payments/payments.module';
import { NotificationsModule } from '../feature/notifications/notifications.module';
import { SuperAdminModule } from '../feature/superAdmin/superAdmin.module';
import { ContentModule } from '../feature/content/content.module';
import { FileServiceModule } from '../support.modules/file/file.module';
import { MessengerModule } from '../feature/messenger/messenger.module';

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
    ClientsModule.registerAsync([ // TODO remove
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
    ]),
    GrpcServiceModule,
    UsersAccountsModule,
    ProfileModule,
    PaymentsModule,
    NotificationsModule,
    SuperAdminModule,
    ContentModule,
    FileServiceModule,
    MessengerModule

  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
