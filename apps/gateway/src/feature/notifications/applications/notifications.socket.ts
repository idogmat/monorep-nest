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
import { RemoteRedisService } from '../../../support.modules/redis/remote.redis.service';
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
    private readonly redisService: RemoteRedisService,
  ) { }
  @WebSocketServer()
  server: Server;


  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    try {
      const payload = await this.redisService.get<IAuthUser>(token);
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
      console.log('📩 Received from client:', client.data.user);
      const notifications = await this.notificationsRepository.getNotificationsSubscribe(client.data.user)
      console.log(notifications)
      if (notifications?.[0]?.expiresAt) {
        const result = findDiffDate(notifications[0].expiresAt)
        client.emit('notifications-response', result);
      }
      // this.server.to(users.get(client.data.user)).emit('notifications-response', { result: 'sdsdsddsd' });
    } catch (error) {
      console.warn('socket content error')
    }
  }

  async sendNotifies(userId: string, payload: any, type?: string): Promise<void> {
    try {
      const clientKey = users.get(userId)
      if (!clientKey) return
      const result = { ...payload }
      if (type) {
        Object.assign(result, { type });
      }
      this.server.to(clientKey).emit('notifications-response', result);
    } catch (error) {
      console.warn('socket content error')
    }
  }
}