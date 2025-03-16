import { Injectable } from '@nestjs/common';
import { DataMailType } from './types/data.mail.types';
import { registrationEmail } from './const/registration.email';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailRouter {
  readonly baseUrl: string
  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('BASE_URL')
  }
  getDataMailForRegisrtation(
    email: string,
    confirmationCode: string,
  ): DataMailType {
    const textMessage = `<h1>Thank for your registration</h1><p>To finish registration please follow the link below:<a href='${this.baseUrl}/confirm-email?code=${confirmationCode}'>complete registration</a></p>`;
    return {
      from: '"In-gram"',
      to: email,
      subject: registrationEmail,
      html: textMessage,
    };
  }
  getDataMailVerify(
    email: string,
    confirmationCode: string,
  ): DataMailType {
    const textMessage = `<h1>Your new Verify code</h1><p>To finish registration please follow the link below:<a href='${this.baseUrl}/confirm-email?code=${confirmationCode}'>complete registration</a></p>`;
    return {
      from: '"In-gram"',
      to: email,
      subject: 'Your new Verify code',
      html: textMessage,
    };
  }
  getDataRecoveryPassword(
    email: string,
    recoveryCode: string,
  ): DataMailType {
    const textMessage = `<h1>Your new Recovery link </h1><p>For recovery password follow the link below:<a href='${this.baseUrl}/reset-password?token=${recoveryCode}'>Recovery</a></p>`;
    return {
      from: '"In-gram"',
      to: email,
      subject: 'Your new Recovery code',
      html: textMessage,
    };
  }
}