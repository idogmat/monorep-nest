import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType, RedisDefaultModules} from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType<RedisDefaultModules>;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = createClient({
      socket: {
        host: this.configService.get<string>('REDIS_HOST') || '',
        port:  parseInt(this.configService.get<string>('REDIS_PORT') || '0', 10),
      },
      password: this.configService.get<string>('REDIS_PASSWORD') || '',
    })  as RedisClientType<RedisDefaultModules>;

    this.client.on('error', (err) => console.error('Redis Client Error', err));

    await this.client.connect();

  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const stringValue: string = JSON.stringify(value);
    if (ttl) {
      await this.client.set(key, stringValue,  { EX: ttl } );
    } else {
      await this.client.set(key, stringValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return raw ? JSON.parse(raw as string) : null;
  }

  async del(key: any): Promise<void> {
    await this.client.del(key);
  }

  async flush(): Promise<void> {
    await this.client.flushAll();
  }
}
