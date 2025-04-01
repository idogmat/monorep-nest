import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GoogleTokenModel } from '../../api/models/input/google.token.model';
import { GoogleService } from '../../../../../common/provider/google.service';
import { InterlayerNotice } from '../../../../../common/error-handling/interlayer.notice';
import { AuthService } from '../auth.service';
import { Provider, User } from '@prisma/client';
import { GoogleAuthResponseModel } from '../../api/models/shared/google.auth.response.model';
import { UsersPrismaRepository } from '../../../users/infrastructure/prisma/users.prisma.repository';
import { DeviceService } from '../../../devices/application/device.service';
import { GateService } from '../../../../../common/gate.service';

export class OauthGoogleCommand {
  constructor(public googleTokenModel: GoogleTokenModel) {
  }

}

@CommandHandler(OauthGoogleCommand)
export class OauthGoogleUseCase implements ICommandHandler<OauthGoogleCommand> {
  constructor(
    private userPrismaRepository: UsersPrismaRepository,
    private googleService: GoogleService,
    private authService: AuthService,
    private deviceService: DeviceService,
    readonly gateService: GateService,

  ) {
  }


  async execute(command: OauthGoogleCommand): Promise<InterlayerNotice<GoogleAuthResponseModel>> {

    const { token, ip, title } = command.googleTokenModel;

    try {
      const payload = await this.googleService.validate(token);
      const { sub, email } = payload;

      //find user by provider Id or email Id
      let user = await this.userPrismaRepository.findUserByProviderIdOrEmail({ providerId: sub, email });
      let d = null
      if (!user) {
        //create user and provider from google
        user = await this.userPrismaRepository.createUserWithProvider(email, email.split('@')[0], { googleId: sub });
        const profile = await this.gateService.profileServicePost('', {
          userId: user.id, userName: user.name, email: user.email
        }, {})
      } else {
        await this.linkGoogleProvider(user, sub);
      }

      const updatedAt = new Date()
      d = await this.deviceService.find({ ip, title, userId: user.id, updatedAt })
      if (!d) {
        d = await this.deviceService.createDevice({ ip, title, userId: user.id })
      }
      d = await this.deviceService.update({ ...d, updatedAt })
      const [accessToken, refreshToken] = await this.authService.createPairTokens({
        userId: user.id,
        deviceId: d.id,
        updatedAt
      });

      return new InterlayerNotice(new GoogleAuthResponseModel(accessToken, refreshToken));
    } catch (error) {
      console.error('Error during Google OAuth execution:', error);
      throw new Error('Failed to authenticate with Google');
    }

  }
  private async linkGoogleProvider(user: User & { providers: Provider | null }, providerId: string) {
    if (!user.providers) {
      await this.userPrismaRepository.createProvider(user.id, { googleId: providerId });
    } else if (!user.providers.googleId) {
      await this.userPrismaRepository.updateProvider(user.providers.id, { googleId: providerId });
    }
  }
}