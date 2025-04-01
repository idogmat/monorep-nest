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
export class AuthGuardOptional implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly deviceService: DeviceService,
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.headers?.authorization) { return true };
    let res: IAuthUser | null = null;
    try {
      const token = request.headers?.authorization?.split(" ");
      res = await this.jwtService.verify(token[1], { secret: this.configService.get('ACCESS_SECRET_TOKEN') });
    } catch {
      console.log('fail');
    }

    const device = await this.deviceService.findById(res.deviceId)

    if (device &&
      device.updatedAt?.toISOString() === res?.updatedAt
      && res.exp * 1000 > new Date().getTime()
    ) {
      Object.assign(request, { user: res })
      return true;
    }
  }
}