import { Injectable } from '@nestjs/common';
import { EmailRouter } from './email.router';
import { EmailAdapter } from './email.adapter';

@Injectable()
export class EmailService {
  constructor(
    private emailRouter: EmailRouter,
    private emailAdapter: EmailAdapter,
  ) { }
  async sendRegisrtationEmail(email: string, confirmationCode: string) {
    const dataMail = this.emailRouter.getDataMailForRegisrtation(
      email,
      confirmationCode,
    );
    // TODO EMAIL CRED
    // await this.emailAdapter.sandMail(dataMail);
  }
  async sendVerifyEmail(email: string, confirmationCode: string) {
    const dataMail = this.emailRouter.getDataMailVerify(
      email,
      confirmationCode,
    );
    // await this.emailAdapter.sandMail(dataMail);
  }
  async sendRecoveryCode(email: string, recoveryCode: string) {
    const dataMail = this.emailRouter.getDataRecoveryPassword(
      email,
      recoveryCode,
    );
    // await this.emailAdapter.sandMail(dataMail);
  }
}