import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

interface IAuthUser {
  id: string
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
    Object.assign(request, { user: res })
    return true;
  }
}