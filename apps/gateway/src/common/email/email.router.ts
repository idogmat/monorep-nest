import { Injectable } from '@nestjs/common';
import { DataMailType } from './types/data.mail.types';
import { registrationEmail } from './const/registration.email';

@Injectable()
export class EmailRouter {
  getDataMailForRegisrtation(
    email: string,
    confirmationCode: string,
  ): DataMailType {
    const textMessage = `<h1>Thank for your registration</h1><p>To finish registration please follow the link below:<a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a></p>`;
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
    const textMessage = `<h1>Your new Verify code</h1><p>To finish registration please follow the link below:<a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a></p>`;
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
    const textMessage = `<h1>Your new Recovery link </h1><p>For recovery password follow the link below:<a href='https://somesite.com/recovery-password?code=${recoveryCode}'>Recovery</a></p>`;
    return {
      from: '"In-gram"',
      to: email,
      subject: 'Your new Recovery code',
      html: textMessage,
    };
  }
  getDataMailForRecoveryPassword(
    email: string,
    confirmationCode: string,
  ): DataMailType {
    const textMessage = `<h1>Password recovery</h1><p>To finish password recovery please follow the link below:<a href='https://somesite.com/password-recovery?recoveryCode=${confirmationCode}'>recovery password</a></p>`;
    return {
      from: '"In-gram"',
      to: email,
      subject: registrationEmail,
      html: textMessage,
    };
  }
}