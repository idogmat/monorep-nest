import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';

@Injectable()
export class DelayRabbitService implements OnModuleInit {
  private channel: amqplib.Channel;
  private amqp: string;
  constructor(private configService: ConfigService) {
    this.amqp = this.configService.get('RABBIT_URLS')[0];
  }

  async onModuleInit() {
    const conn = await amqplib.connect(this.amqp);
    this.channel = await conn.createChannel();
  }

  async publishWith30SecondsDelay(destinationQueue: string, payload: any) {
    const delayExchange = 'temp_delay_exchange';
    const delayQueue = `delay_30000_payments_queue`;
    console.log('send')
    await this.channel.assertExchange(delayExchange, 'direct', { durable: true });

    await this.channel.assertQueue(delayQueue, {
      durable: true,
      arguments: {
        'x-message-ttl': 5000,
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': destinationQueue,
      },
    });

    await this.channel.bindQueue(delayQueue, delayExchange, delayQueue);

    this.channel.publish(
      delayExchange,
      delayQueue,
      Buffer.from(JSON.stringify(payload)),
    );
  }
}