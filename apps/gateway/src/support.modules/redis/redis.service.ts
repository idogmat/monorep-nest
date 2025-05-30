// redis.service.ts
import { Injectable, Inject} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';


@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
  }

  async testConnection(): Promise<void> {
    await this.cacheManager.set('testkey', { foo: 'bar' },  6000 );
    const val = await this.cacheManager.get('testkey');
    console.log('Test key from cache-manager:', val);
  }
  async set(key: string, value: any, ttl?: number): Promise<void> {

    await this.cacheManager.set(key, value,  ttl );

  }

  async get<T>(key: string): Promise<T | null> {
    return (await this.cacheManager.get(key)) as T;
  }

  // async showAll<T>(key: string): Promise<T | null> {
  //   return (await this.cacheManager.stores) as T;
  // }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.clear();
  }
}

