import { Injectable } from '@nestjs/common';
import { EmailService } from '../../../../common/email/email.service';
import { UsersPrismaRepository } from '../../users/infrastructure/prisma/users.prisma.repository';
import { InterlayerNotice } from '../../../../common/error-handling/interlayer.notice';
import { AuthError } from '../../../../common/error-handling/auth.error';
import { ENTITY_USER } from '../../../../common/entities.constants';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(
    private userPrismaRepository: UsersPrismaRepository,
    private emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }
  async sendVerifyEmail(email) {
    try {
      const user = await this.userPrismaRepository.findUserByEmail(email);
      if (user.isConfirmed)
        return InterlayerNotice.createErrorNotice(
          AuthError.CONFIRMATION_ERROR,
          ENTITY_USER,
          400
        );
      user.confirmationCode = Math.random().toString(36).substring(2, 15)
      await this.userPrismaRepository.updateUserById(user.id, user)
      this.emailService.sendVerifyEmail(
        user.email,
        user.confirmationCode,
      );
    } catch (error) {
      return InterlayerNotice.createErrorNotice(
        error,
        ENTITY_USER,
        400
      );
    }
  }

  async createToken(payload: any, type: 'ACCESS' | 'REFRESH') {
    const signOptions = {
      secret: this.configService.get(`${type}_TOKEN`) || 'TEST',
      expiresIn: this.configService.get(`${type}_TOKEN_EXPIRATION`) || 'TEST'
    }
    const token = await this.jwtService.sign(
      payload,
      signOptions
    );
    return token;
  }

}