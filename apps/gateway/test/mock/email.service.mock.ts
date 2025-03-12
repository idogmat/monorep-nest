import { EmailService } from '../../src/common/email/email.service';
import { EmailRouter } from '../../src/common/email/email.router';
import { EmailAdapter } from '../../src/common/email/email.adapter';

export class EmailServiceMock extends EmailService {
  constructor(emailRouter: EmailRouter, emailAdapter: EmailAdapter) {
    super(emailRouter, emailAdapter);
  }
  async sendRegisrtationEmail(email: string, confirmationCode: string) {
    console.log('Call mock method sendRegisrtationEmail / MailService');
    // return Promise.resolve(true);
  }
  async sendRecoveryPassword(email: string, confirmationCode: string) {
    console.log('Call mock method sendRecoveryPassword / MailService');
    // return Promise.resolve(true);
  }
}