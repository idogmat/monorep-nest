import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { PostsController } from './api/posts.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CreatePostUseCases } from './application/use-cases/create.post.use.cases';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { DeviceService } from '../user-accounts/devices/application/device.service';
import { GateService } from '../../common/gate.service';
import { PostMicroserviceService } from './application/services/post.microservice.service';
import { PostResolver } from './api/post.resolver';
import { ProfileModule } from '../profile/profile.module';
import { PostGraphqlService } from './application/services/post.graphql.service';
import { UsersAccountsModule } from '../user-accounts/users.accounts.module';
import { UserLoader } from '../user-accounts/devices/loaders/user.loader';
import { PostFieldResolver } from './api/post-field.resolver';
import { ProfileLoader } from '../profile/application/profile.loader';

const useCasesForPost = [
  CreatePostUseCases]
@Module({
  imports: [
    CqrsModule,
    UsersAccountsModule,
    HttpModule,
    ProfileModule,
    MulterModule.register({
      dest: './uploads',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get<string | number>('ACCESS_TOKEN_EXPIRATION'),
        },
      }),
    }),
  ],
  providers: [
    PrismaService,
    DeviceService,
    GateService,
    PostMicroserviceService,
    PostResolver,
    PostFieldResolver,
    UserLoader,
    ProfileLoader,
    PostGraphqlService,
    ...useCasesForPost
  ],
  controllers: [PostsController],
  exports: [HttpModule, GateService, PostMicroserviceService, PostResolver, PostGraphqlService]
})
export class PostsModule { }