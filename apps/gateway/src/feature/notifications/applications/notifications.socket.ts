import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsRepository } from '../infrastrucrure/notifications.repository';
import { findDiffDate } from './date.helper';
import { RedisService } from '../../../support.modules/redis/redis.service';
import { IAuthUser } from '../../../common/guard/authGuard';

const users = new Map()

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationsSocket implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly redisService: RedisService,
  ) { }
  @WebSocketServer()
  server: Server;


  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    try {
      const payload: IAuthUser | null = await this.redisService.get(token);
      client.data.user = payload.userId;
      users.set(payload.userId, client.id);
      console.log(`🔌 Client connected: ${payload.userId}`);
    } catch (err) {
      console.log('❌ Invalid token:', err.message);
      client.disconnect();
    }
    this.server.emit('server-response', { msg: 'token-taken' });
    // console.log('🔌 Client connected:', token);
  }

  handleDisconnect(client: Socket) {
    users.delete(client.id);
    console.log('❌ Client disconnected:', client.id);
  }

  @SubscribeMessage('test-message')
  handleMessage(
    @MessageBody() data: any,
  ): void {
    console.log('📩 Received from client:', data);
    this.server.emit('server-response', { msg: 'Message received!' });
  }

  @SubscribeMessage('notifications')
  async getNotifies(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    try {
      console.log('📩 Received from client:', client);
      const notifications = await this.notificationsRepository.getNotifications(client.data.user)
      console.log(notifications)
      const mapped = notifications.reduce((acc, e) => {
        if (acc?.expiresAt) acc = e
        if (acc.expiresAt > new Date() && acc.createdAt < new Date()) acc = e
        return acc
      })
      const result = findDiffDate(mapped.expiresAt)
      client.emit('notifications-response', { result });
    } catch (error) {

    }
  }
}