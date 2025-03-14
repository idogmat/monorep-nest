import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GoogleTokenModel } from '../../api/models/input/google.token.model';
import { UsersPrismaRepository } from '../../../users/infrastructure/prisma/users.prisma.repository';
import { GoogleService } from '../../../../../common/provider/google.service';
import { InterlayerNotice } from '../../../../../common/error-handling/interlayer.notice';
import { AuthService } from '../auth.service';

export class OauthGoogleCommand {
  constructor(public googleTokenModel: GoogleTokenModel) {
  }

}

@CommandHandler(OauthGoogleCommand)
export class OauthGoogleUseCase implements ICommandHandler<OauthGoogleCommand> {
  constructor(private userPrismaRepository: UsersPrismaRepository,
              private googleService: GoogleService,
              private authService: AuthService) {
  }


  async execute(command: OauthGoogleCommand) {

    const { token } = command.googleTokenModel;

    try {
      const payload = await this.googleService.validate(token);
      const { sub, email } = payload;

      //find user by provider Id or email Id
      const foundUser = await this.userPrismaRepository.findUserByProviderIdOrEmail({ providerId: sub, email });

      let user;
      if (!foundUser) {
        //create user and provider from google
        user = await this.userPrismaRepository.createUserWithProvider(email, email.split('@')[0], { googleId: sub });
      } else {
        user = foundUser;
        if (!foundUser.providers) {
          await this.userPrismaRepository.createProvider(foundUser.id, { googleId: sub });
        } else if (!foundUser.providers.googleId) {
          await this.userPrismaRepository.updateProvider(foundUser.providers.id, { googleId: sub });
        }
      }
      const [accessToken, refreshToken] = await this.authService.createPairTokens(user.id);
      console.log("user", user);
      console.log("accessToken", accessToken);
      console.log("refreshToken", refreshToken);
      return new InterlayerNotice({ accessToken, refreshToken });
    } catch (error) {
      console.error('Error during Google OAuth execution:', error);
      throw new Error('Failed to authenticate with Google');
    }

  }
}