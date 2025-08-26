import * as amqplib from 'amqplib';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { DeletePhotoMediaCommand } from './use-cases/delete.photo.media.use-case';
import { DeleteProfileMediaCommand } from './use-cases/delete.profile.media.use-case';

@Injectable()
export class RabbitConsumerService implements OnModuleInit {
  private readonly logger = new Logger(RabbitConsumerService.name);
  private connection: amqplib.Connection;
  private channel: amqplib.Channel;

  constructor(
    private configService: ConfigService,
    private commandBus: CommandBus
  ) { }

  async onModuleInit() {
    await this.connectAndConsume();
  }

  private async connectAndConsume() {
    try {
      const urls = this.configService.get<string>('RABBIT_URLS')[0];
      this.connection = await amqplib.connect(urls);
      this.channel = await this.connection.createChannel();

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed. Reconnecting...');
        setTimeout(() => this.connectAndConsume(), 5000);
      });

      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error', err);
      });

      // Настройка очереди
      const queueName = 'file_queue';
      await this.channel.assertQueue(queueName, { durable: true });
      await this.channel.prefetch(10); // Ограничиваем количество одновременно обрабатываемых сообщений

      // Запуск потребителя
      this.channel.consume(queueName, async (msg) => {
        if (msg !== null) {
          try {
            const content = JSON.parse(msg.content.toString());
            this.logger.log(`Received message: ${JSON.stringify(content)}`);

            // Обработка сообщения
            await this.handleMessage(content);

            // Подтверждение успешной обработки
            this.channel.ack(msg);
          } catch (err) {
            this.logger.error(`Error processing message: ${err.message}`, err.stack);

            // Обработка ошибок (можно настроить политику повтора)
            this.handleError(msg, err);
          }
        }
      });

      this.logger.log(`Listening for messages on ${queueName}`);
    } catch (err) {
      this.logger.error('Failed to connect to RabbitMQ', err);
      setTimeout(() => this.connectAndConsume(), 5000);
    }
  }

  private async handleMessage(message: any) {
    // Реализуйте вашу бизнес-логику здесь
    switch (message.type) {
      case 'DELETE_POSTS_PHOTO':
        if (message?.userId && message?.postId) {
          await this.commandBus.execute(new DeletePhotoMediaCommand(message.userId, message.postId));
        }
        break;
      case 'DELETE_PROFILE_PHOTO':
        if (message?.userId) {
          await this.commandBus.execute(new DeleteProfileMediaCommand(message.userId));
        }
        // await this.handlePostUpdated(message.data);
        break;
      default:
        this.logger.warn(`Unknown message type: ${message.type}`);
    }
  }

  private async handlePostUpdated(postData: any) {
    this.logger.log(`Processing POST_UPDATED event for post ${postData.id}`);
    // Логика обработки обновления поста
  }

  private handleError(msg: amqplib.Message, error: Error) {
    // Стратегии обработки ошибок:
    const maxRetries = 5;
    const headers = msg.properties.headers || {};
    const retryCount = headers['x-retry-count'] || 0;

    if (retryCount < maxRetries) {
      // Повторная попытка с задержкой
      const newHeaders = {
        ...headers,
        'x-retry-count': retryCount + 1,
      };

      // Отправляем в очередь повтора
      this.channel.sendToQueue(
        'file_queue_retry',
        msg.content,
        { headers: newHeaders }
      );
      this.channel.ack(msg);
    } else {
      // Отправка в очередь мертвых писем
      this.channel.sendToQueue(
        'file_queue_dead_letter',
        msg.content,
        { headers: { ...headers, 'x-death-reason': error.message } }
      );
      this.channel.ack(msg);
    }
  }
}