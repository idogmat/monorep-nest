import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitService implements OnModuleInit, OnModuleDestroy {
  private channel: amqplib.Channel;
  private connection: amqplib.Connection;
  private readonly logger = new Logger(RabbitService.name);
  private amqp: string;
  constructor(
    private configService: ConfigService
  ) {
    this.amqp = this.configService.get('RABBIT_URLS')[0];
  }

  async onModuleInit() {
    const connection = await amqplib.connect(this.amqp);
    this.channel = await connection.createChannel();
  }
  async onModuleDestroy() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }

  async publishToQueue(queueName: string, payload: any) {
    try {
      // Убедимся что очередь существует
      await this.channel.assertQueue(queueName, {
        durable: true, // Сохранять сообщения при рестарте RabbitMQ
      });

      // Отправляем сообщение напрямую в очередь
      const success = this.channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true } // Сохранять сообщения на диске
      );

      if (!success) {
        this.logger.warn(`Message not delivered to ${queueName} (queue full?)`);
        throw new Error('Queue is full or unavailable');
      }

      this.logger.log(`Message sent to ${queueName}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to publish to ${queueName}`, err);
      throw new Error(`Message publish failed: ${err.message}`);
    }
  }
}