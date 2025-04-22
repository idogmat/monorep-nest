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
    PostModule
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule { }
