import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { DeviceService } from "../../feature/user-accounts/devices/application/device.service";
import { RedisService } from "../../support.modules/redis/redis.service";

export interface IAuthUser {
  userId: string;
  deviceId: string;
  updatedAt: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthGuardOptional implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly deviceService: DeviceService,
    private readonly redisService: RedisService,

  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.headers?.authorization) return true;
    try {
      const token = request.headers?.authorization?.split(" ");
      const userInfo: IAuthUser | null = await this.redisService.get(token[1])
      if (userInfo) {
        Object.assign(request, { user: userInfo })
        return true;
      } else {
        return true
      }
    } catch {
      console.log('fail');
      return true
    }
  }
}