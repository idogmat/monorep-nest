import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class DelayRabbitService implements OnModuleInit {
  private channel: amqplib.Channel;

  async onModuleInit() {
    const conn = await amqplib.connect('amqp://user:password@localhost:5672');
    this.channel = await conn.createChannel();
  }

  async publishWith30SecondsDelay(destinationQueue: string, payload: any) {
    const delayExchange = 'temp_delay_exchange';
    const delayQueue = `delay_30000_payments_queue`;

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