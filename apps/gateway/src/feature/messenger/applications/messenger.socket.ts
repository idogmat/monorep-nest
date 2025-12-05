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
import { RemoteRedisService } from '../../../support.modules/redis/remote.redis.service';
import { IAuthUser } from '../../../common/guard/authGuard';
import { MessengerClientService } from '../../../support.modules/grpc/grpc.messenger.service';

@WebSocketGateway({
  namespace: 'messages',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class MessengerSocket implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly redisService: RemoteRedisService,
    private readonly messengerClientService: MessengerClientService,

  ) { }
  @WebSocketServer()
  server: Server;


  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    try {
      const payload = await this.redisService.get<IAuthUser>(token);
      client.data.user = payload.userId;
      console.log(payload)
      // users.set(payload.userId, client.id);
      console.log(`🔌 Client connected: ${payload.userId}`);
    } catch (err) {
      console.log('❌ Invalid token:', err.message);
      client.disconnect();
    }
    this.server.emit('server-response', { msg: 'token-taken' });
    // console.log('🔌 Client connected:', token);
  }

  handleDisconnect(client: Socket) {
    console.log('❌ Client disconnected:', client.id);
  }

  // return chats list
  @SubscribeMessage('chats')
  async chatConnection(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    console.log(client.data.user)
    const senderId = client.data?.user?.toString() || ''
    const result = await this.messengerClientService.getChats({ senderId })

    console.log('📩 Received from client:', result);
    this.server.emit('server-response', { result });
  }

  // return chat messages
  @SubscribeMessage('chat-list')
  chatMessages(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket
  ): void {
    console.log(client.data.user)
    console.log('📩 Received from client:', data);
    this.server.emit('server-response', { msg: 'client' });
  }

  // send message
  // vokixe@dpcos.com
  // vokixe5@dpcos.com
  @SubscribeMessage('message')
  async sendMessage(
    @MessageBody() data: { message: string, userId: string },
    @ConnectedSocket() client: Socket
  ): Promise<void> {

    try {
      const { message, userId } = data;
      console.log(client.data.user)
      console.log('📩 Received from client:', data);

      const senderId = client.data?.user?.toString() || ''
      const send = { senderId, userId, message }
      const result = await this.messengerClientService.createMessage(send)
      console.log(result, 'result')
      this.server.emit('server-response', { result });
    } catch (error) {
      console.log(error)
    }
  }


  async sendNotifies(userId: string, payload: any, type?: string): Promise<void> {
    try {
      // const clientKey = users.get(userId)
      // if (!clientKey) return
      // const result = { ...payload }
      // if (type) {
      //   Object.assign(result, { type });
      // }
      // this.server.to(clientKey).emit('notifications-response', result);
    } catch (error) {
      console.warn('socket content error')
    }
  }
}