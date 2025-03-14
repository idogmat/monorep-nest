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

  async execute(command: OauthGoogleCommand):Promise<InterlayerNotice<{ accessToken, refreshToken }>> {

    const { token } = command.googleTokenModel;

    const payload = await this.googleService.validate(token);
    const { sub, email } = payload;

    //create user and provider from google
    const user = await this.userPrismaRepository.createUserWithProvider(email, email.split('@')[0], { googleId: sub });

    // const [accessToken, refreshToken] = await Promise.all(
    //   [
    //     await this.authService.createToken({
    //       userId: user.id,
    //     }, 'ACCESS'),
    //     await this.authService.createToken({
    //       userId: user.id,
    //     }, 'REFRESH'),
    //   ]);
    // return new InterlayerNotice({ accessToken, refreshToken });

  }
}