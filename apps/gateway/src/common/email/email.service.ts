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
    await this.emailAdapter.sandMail(dataMail);
  }
  async sendVerifyEmail(email: string, confirmationCode: string) {
    const dataMail = this.emailRouter.getDataMailVerify(
      email,
      confirmationCode,
    );
    await this.emailAdapter.sandMail(dataMail);
  }
  async sendRecoveryPassword(email: string, confirmationCode: string) {
    const dataMail = this.emailRouter.getDataMailForRecoveryPassword(
      email,
      confirmationCode,
    );
    await this.emailAdapter.sandMail(dataMail);
  }
}