import { Module } from '@nestjs/common';
import { UsersService } from './users/application/users.service';
import { UsersController } from './users/api/users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth/application/auth.service';
import { AuthController } from './auth/api/auth.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { SignupUseCase } from './auth/application/use-cases/signup.use.case';
import { BcryptService } from './auth/infrastructure/bcrypt.service';
import { UsersPrismaRepository } from './users/infrastructure/prisma/users.prisma.repository';
import { EmailService } from '../../common/email/email.service';
import { EmailAdapter } from '../../common/email/email.adapter';
import { EmailRouter } from '../../common/email/email.router';
import { VerifyEmailUseCase } from './auth/application/use-cases/verify.email.case';
import { LoginUseCase } from './auth/application/use-cases/login.case';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const useCasesForAuth = [
  SignupUseCase,
  VerifyEmailUseCase,
  LoginUseCase
];
@Module({
  imports: [
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
    BcryptService,
    EmailService,
    EmailAdapter,
    EmailRouter,
    ...useCasesForAuth
  ],
  controllers: [UsersController, AuthController],
  exports: []
})
export class UsersAccountsModule { }
