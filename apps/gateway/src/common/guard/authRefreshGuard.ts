import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { DeviceService } from "../../feature/user-accounts/devices/application/device.service";

export interface IAuthUser {
  userId: string;
  deviceId: string;
  updatedAt: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthRefreshGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly deviceService: DeviceService,
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.cookies?.refreshToken) return false
    const token = request.cookies.refreshToken
    let res: IAuthUser | null = null;
    try {
      res = await this.jwtService.verify(token, { secret: this.configService.get('REFRESH_TOKEN') });
    } catch {
      console.log('fail');
    }

    const device = await this.deviceService.findById(res?.deviceId)

    if (device &&
      device.updatedAt?.toISOString() === res?.updatedAt
      && res.exp * 1000 > new Date().getTime()
    ) {
      Object.assign(request, { user: res })
      return true;
    } else {
      return false
    }

  }
}