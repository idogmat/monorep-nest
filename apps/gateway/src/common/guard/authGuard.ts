import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RemoteRedisService } from '../../support.modules/redis/remote.redis.service';

export interface IAuthUser {
  userId: string;
  deviceId: string;
  updatedAt: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly redisService: RemoteRedisService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.headers?.authorization) return false;
    try {
      const token = request.headers?.authorization?.split(' ');
      const userInfo: IAuthUser | null = await this.redisService.get(token[1]);
      console.log(`🔵 Redis GET ключ: "${token[1]}", результат:`, userInfo);
      if (userInfo) {
        Object.assign(request, { user: userInfo });
        return true;
      } else {
        return false;
      }
    } catch {
      console.log('fail');
    }
  }
}
