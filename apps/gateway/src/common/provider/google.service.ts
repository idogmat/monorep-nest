import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { TokenPayload } from 'google-auth-library/build/src/auth/loginticket';
import { InterlayerNotice } from '../error-handling/interlayer.notice';
import { AuthError } from '../error-handling/auth.error';
import { ENTITY_USER } from '../entities.constants';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class GoogleService{
  private readonly client: OAuth2Client;
  private readonly googleClientId: string;
  constructor(
    private configService: ConfigService,
  ) {
    this.googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.client = new OAuth2Client(this.googleClientId);
  }
  async validate(code: string):Promise<TokenPayload>{

      const ticket = await this.client.verifyIdToken({
        idToken: code,
        audience: this.googleClientId
      });
      const payload: TokenPayload | null = ticket.getPayload();

      if(!payload){
        throw InterlayerNotice.createErrorNotice(
          AuthError.INVALID_GOOGLE_TOKEN,
          ENTITY_USER,
          400
        );
      }
      return payload;
  }
}