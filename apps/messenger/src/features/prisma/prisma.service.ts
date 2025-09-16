import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../../prisma/generated/messenger-client';


@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error']

    });
  }
  async onModuleInit() {
    await this.$connect();

    // if (process.env.NODE_ENV === 'development') {
    this.$on('query', (e) => {
      console.log('Query:', e.query);
      console.log('Params:', e.params);
      console.log('Duration:', e.duration + 'ms');
    });
    // }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}