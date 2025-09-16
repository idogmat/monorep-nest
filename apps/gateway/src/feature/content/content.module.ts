import { Module } from '@nestjs/common';
import { ContentPostsController } from './posts/api/content.posts.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GrpcServiceModule } from '../../support.modules/grpc/grpc.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    GrpcServiceModule,
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
  ],
  providers: [

  ],
  controllers: [
    ContentPostsController
  ],
  exports: []
})
export class ContentModule { }