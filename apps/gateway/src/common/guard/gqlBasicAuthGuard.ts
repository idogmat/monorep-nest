import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class GqlBasicAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) { }

  canActivate(context: ExecutionContext): boolean {
    const request = this.getRequest(context);
    const authorization = request.headers?.authorization;
    if (!authorization) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [authType, encoded] = authorization.split(' ');
    if (authType !== 'Basic' || !encoded) {
      throw new UnauthorizedException('Invalid Authorization format');
    }

    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const [login, password] = decoded.split(':');

    if (!login || !password) {
      throw new UnauthorizedException('Invalid credentials format');
    }

    const expectedLogin = this.configService.get<string>('ADMIN_LOGIN');
    const expectedPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (login !== expectedLogin || password !== expectedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }

  private getRequest(context: ExecutionContext): any {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    }

    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext().req;
  }
}