import { Injectable } from '@nestjs/common';
import { DataMailType } from './types/data.mail.types';
import { ConfigService } from '@nestjs/config';

import * as nodemailer from 'nodemailer';
@Injectable()
export class EmailAdapter {
  constructor(private configService: ConfigService) {}
  async sandMail(dataMail: DataMailType) {


    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get('EMAIL_FOR_SENDING'),
        pass: this.configService.get('PASSWORD_FOR_EMAIL'),
      },
    });


    return await transporter.sendMail(dataMail);
  }
}