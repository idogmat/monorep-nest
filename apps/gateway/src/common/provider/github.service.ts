import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';

interface GitHubUserInfo {
  login: string;
  providerId: number;
  email: string | null;
}
@Injectable()
export class GithubService{
  private readonly githubClientId: string;
  private readonly githubClientSecret: string;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ){
    this.githubClientId = this.configService.get<string>('GITHUB_CLIENT_ID');
    this.githubClientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET');


  }

  githubAuth() {
    const redirectUri = 'http://localhost:3000/api/v1/auth/github/callback'; // URL callback
    return `https://github.com/login/oauth/authorize?client_id=${this.githubClientId}&redirect_uri=${redirectUri}`;

  }

  async githubAuthCallback(code: string) {
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', null, {
      params: {
        client_id: this.githubClientId,
        client_secret: this.githubClientSecret,
        code,
      },
      headers: {
        'Accept': 'application/json',
      },
    });

    const { access_token } = tokenResponse.data;

    // Здесь можно использовать полученный токен для получения данных о пользователе
    // или для создания сессии и прочего

    return { access_token };
  }

  async getGitHubUserInfo(token: string):Promise<GitHubUserInfo> {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    const data = response.data;
    const emailResponse = await axios.get('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const email = emailResponse.data.find((emailInfo: any) => emailInfo?.primary)?.email||'';
    return {login:data.login, providerId: data.id,  email};
  }
}