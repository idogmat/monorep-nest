import { BadRequestException, Injectable } from '@nestjs/common';
import { EmailService } from '../../../../common/email/email.service';
import { UsersPrismaRepository } from '../../users/infrastructure/prisma/users.prisma.repository';
import { InterlayerNotice } from '../../../../common/error-handling/interlayer.notice';
import { AuthError } from '../../../../common/error-handling/auth.error';
import { ENTITY_USER } from '../../../../common/entities.constants';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { BcryptService } from '../infrastructure/bcrypt.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';


@Injectable()
export class AuthService {
  constructor(
    private userPrismaRepository: UsersPrismaRepository,
    private emailService: EmailService,
    private jwtService: JwtService,
    private bcryptService: BcryptService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) { }
  async sendVerifyEmail(email) {
    try {
      const u = await this.userPrismaRepository.findUserByEmail(email);
      if (u.isConfirmed)
        return InterlayerNotice.createErrorNotice(
          AuthError.CONFIRMATION_ERROR,
          ENTITY_USER,
          400
        );
      u.confirmationCode = randomUUID()
      await this.userPrismaRepository.updateUserById(u.id, u)
      this.emailService.sendVerifyEmail(
        u.email,
        u.confirmationCode,
      );
    } catch (error) {
      return InterlayerNotice.createErrorNotice(
        error,
        ENTITY_USER,
        400
      );
    }
  }

  async sendRecoveryCode(email, recaptchaToken) {
    const RECAPTCHA_SECRET_KEY = this.configService.get('RECAPTCHA_SECRET_KEY')
    const recaptchaResponse = await firstValueFrom(this.httpService.post(`https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`));
    if (!recaptchaResponse.data.success) throw new BadRequestException('reCAPTCHA verification failed')
    try {
      const u = await this.userPrismaRepository.findUserByEmail(email);
      if (!u)
        return InterlayerNotice.createErrorNotice(
          AuthError.CONFIRMATION_ERROR,
          ENTITY_USER,
          400
        );
      u.recoveryCode = randomUUID();
      await this.userPrismaRepository.updateUserById(u.id, u)
      this.emailService.sendRecoveryCode(
        u.email,
        u.recoveryCode,
      );
    } catch (error) {
      return InterlayerNotice.createErrorNotice(
        error,
        ENTITY_USER,
        400
      );
    }
  }

  async setNewPassword(recoveryCode: string, password: string) {
    try {
      const u = await this.userPrismaRepository.findUserByRecoveryCode(recoveryCode);
      if (!u)
        return InterlayerNotice.createErrorNotice(
          AuthError.CONFIRMATION_ERROR,
          ENTITY_USER,
          400
        );
      u.passwordHash = await this.bcryptService.generationHash(
        password,
      );
      u.recoveryCode = null
      await this.userPrismaRepository.updateUserById(u.id, u)
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

  async getById(id: string) {
    return await this.userPrismaRepository.getById(id);
  }

  async createPairTokens(userId: string): Promise<[accessToken: string, refreshToken: string]> {
    return Promise.all(
      [
        await this.createToken({
          userId,
        }, 'ACCESS'),
        await this.createToken({
          userId,
        }, 'REFRESH'),
      ]);

  }
}