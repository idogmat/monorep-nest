import { Module, Global } from '@nestjs/common';
import { RemoteRedisService } from './remote.redis.service';
import { ConfigModule, } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule
    // CacheModule.registerAsync({
    //   isGlobal: true,
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => {
    //     const host = configService.get('REDIS_HOST');
    //     const port = +configService.get('REDIS_PORT');
    //     const password = configService.get('REDIS_PASSWORD');
    //     console.log('Redis config:', { host, port, password: password ? '***' : null });
    //
    //     return {
    //       store: redisStore,
    //       socket: {
    //         host,
    //         port,
    //       },
    //       password,
    //       ttl: 60,
    //     };
    //   },
    // }),
  ],
  providers: [RemoteRedisService],
  exports: [RemoteRedisService],
})

export class RedisModule { }