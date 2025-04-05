import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule { }