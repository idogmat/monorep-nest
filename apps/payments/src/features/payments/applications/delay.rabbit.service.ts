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

  async publish(destinationQueue: string, payload: any) {
    await this.channel.assertQueue(destinationQueue, { durable: true });
    this.channel.sendToQueue(
      destinationQueue,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }, // чтобы RabbitMQ сохранил сообщение на диск
    );
  }

  async publishWithDelay(destinationQueue: string, payload: any, delayMs: number) {
    const delayExchange = 'delay_exchange';
    const delayQueue = `delay_${delayMs}_${destinationQueue}`;

    // создаём exchange
    await this.channel.assertExchange(delayExchange, 'direct', { durable: true });

    // создаём очередь для задержки
    await this.channel.assertQueue(delayQueue, {
      durable: true,
      arguments: {
        'x-message-ttl': delayMs,                  // время жизни сообщения в delay-очереди
        'x-dead-letter-exchange': '',              // после TTL отправляем в дефолтный exchange
        'x-dead-letter-routing-key': destinationQueue, // и дальше в конечную очередь
      },
    });

    // биндим очередь к exchange
    await this.channel.bindQueue(delayQueue, delayExchange, delayQueue);

    // публикуем сообщение
    this.channel.publish(
      delayExchange,
      delayQueue,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true },
    );
  }
}