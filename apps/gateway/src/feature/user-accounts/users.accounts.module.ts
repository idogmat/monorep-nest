import { Module } from '@nestjs/common';
import { UsersService } from './users/application/users.service';
import { UsersController } from './users/api/users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth/application/auth.service';
import { AuthController } from './auth/api/auth.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { SignupUseCase } from './auth/application/use-cases/signup.use.case';
import { BcryptService } from './auth/infrastructure/bcrypt.service';
import { EmailService } from '../../common/email/email.service';
import { EmailAdapter } from '../../common/email/email.adapter';
import { EmailRouter } from '../../common/email/email.router';
import { VerifyEmailUseCase } from './auth/application/use-cases/verify.email.case';
import { LoginUseCase } from './auth/application/use-cases/login.case';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { OauthGoogleUseCase } from './auth/application/use-cases/oauth.google.use.case';
import { GoogleService } from '../../common/provider/google.service';
import { GithubService } from '../../common/provider/github.service';
import { GithubAuthCallbackUseCase } from './auth/application/use-cases/github.auth.callback.use.case';
import { UsersPrismaQueryRepository } from './users/infrastructure/prisma/users.prisma.query-repository';
import { UsersPrismaRepository } from './users/infrastructure/prisma/users.prisma.repository';
import { DeviceService } from './devices/application/device.service';
import { DevicesController } from './devices/api/devices.controller';
import { DeviceQueryRepository } from './devices/infrastructure/device.prisma.query-repository';
import { GateService } from '../../common/gate.service';

const useCasesForAuth = [
  SignupUseCase,
  VerifyEmailUseCase,
  LoginUseCase,
  OauthGoogleUseCase,
  GithubAuthCallbackUseCase
];
@Module({
  imports: [
    HttpModule,
    CqrsModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('ACCESS_TOKEN'),
          signOptions: { expiresIn: configService.get('ACCESS_TOKEN_EXPIRATION') },
        };
      },
      inject: [ConfigService]
    }),
  ],

  providers: [
    AuthService,
    UsersService,
    PrismaService,
    BcryptService,
    UsersPrismaRepository,
    UsersPrismaQueryRepository,
    BcryptService,
    EmailService,
    EmailAdapter,
    EmailRouter,
    GoogleService,
    GithubService,
    DeviceService,
    DeviceQueryRepository,
    GateService,
    ...useCasesForAuth
  ],
  controllers: [UsersController, AuthController, DevicesController],
  exports: [HttpModule, JwtModule, DeviceService]
})
export class UsersAccountsModule { }
