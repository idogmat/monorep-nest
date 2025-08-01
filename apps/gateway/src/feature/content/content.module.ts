import { Module } from '@nestjs/common';
import { RedisModule } from '../../support.modules/redis/redis.module';
import { ContentPostsController } from './posts/api/content.posts.controller';
import { ContentCommentsController } from './comments/api/content.comments.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GrpcServiceModule } from '../../support.modules/grpc/grpc.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('ACCESS_TOKEN'),
          signOptions: { expiresIn: configService.get('ACCESS_TOKEN_EXPIRATION') },
        };
      },
      inject: [ConfigService]
    }),
    GrpcServiceModule
  ],
  providers: [

  ],
  controllers: [ContentPostsController, ContentCommentsController],
  exports: []
})
export class ContentModule { }