import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GithubTokenModel } from '../../api/models/input/github.token.model';
import { GithubService } from '../../../../../common/provider/github.service';
import { InterlayerNotice } from '../../../../../common/error-handling/interlayer.notice';
import { AuthError } from '../../../../../common/error-handling/auth.error';
import { ENTITY_USER } from '../../../../../common/entities.constants';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { GithubAuthResponseModel } from '../../api/models/shared/github.auth.response.model';
import { Provider, User } from '@prisma/client';
import { UsersPrismaRepository } from '../../../users/infrastructure/prisma/users.prisma.repository';
import { GateService } from '../../../../../common/gate.service';

export class GithubAuthCallbackCommand {
  constructor(
    public queryDto: GithubTokenModel,
  ) {
  }

}

@CommandHandler(GithubAuthCallbackCommand)
export class GithubAuthCallbackUseCase implements ICommandHandler<GithubAuthCallbackCommand> {
  constructor(
    private githubService: GithubService,
    private userPrismaRepository: UsersPrismaRepository,
    private authService: AuthService,
    private configService: ConfigService,
    readonly gateService: GateService,

  ) {
  }
  async execute(command: GithubAuthCallbackCommand): Promise<InterlayerNotice<GithubAuthResponseModel>> {

    try {
      const result = await this.githubService.githubAuthCallback(command.queryDto.code as string);
      const userInfo = await this.githubService.getGitHubUserInfo(result.access_token);
      if (!userInfo.email) {
        return InterlayerNotice.createErrorNotice(
          AuthError.GITHUB_USER_DOESNT_HAVE_EMAIL,
          ENTITY_USER,
          404
        )
      }
      //find user by provider Id or email Id
      let user = await this.userPrismaRepository.findUserByProviderIdOrEmail({ providerId: userInfo.providerId.toString(), email: userInfo.email });

      if (!user) {
        //create user and provider from google
        user = await this.userPrismaRepository.createUserWithProvider(userInfo.email, userInfo.email.split('@')[0], { githubId: userInfo.providerId.toString() });
      } else {
        await this.linkGithubProvider(user, userInfo.providerId.toString());
      }
      const profile = await this.gateService.profileServicePost('', {}, {
        userId: user.id, userName: user.name, email: user.email
      })
      const [accessToken, refreshToken] = await this.authService.createPairTokens({ userId: user.id });
      const baseURL = this.configService.get<string>('BASE_URL')
      return new InterlayerNotice(new GithubAuthResponseModel(accessToken, refreshToken, baseURL));

    } catch (error) {
      console.error('Error during Github OAuth execution:', error);
      throw new Error('Failed to authenticate with GitHub');
    }


  }
  private async linkGithubProvider(user: User & { providers: Provider | null }, providerId: string) {
    if (!user.providers) {
      await this.userPrismaRepository.createProvider(user.id, { githubId: providerId });
    } else if (!user.providers.githubId) {
      await this.userPrismaRepository.updateProvider(user.providers.id, { githubId: providerId });
    }
  }
}