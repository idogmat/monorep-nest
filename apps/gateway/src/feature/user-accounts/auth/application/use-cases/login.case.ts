import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersPrismaRepository } from '../../../users/infrastructure/prisma/users.prisma.repository';
import { InterlayerNotice } from '../../../../../common/error-handling/interlayer.notice';
import { AuthError } from '../../../../../common/error-handling/auth.error';
import { ENTITY_USER } from '../../../../../common/entities.constants';
import { BcryptService } from '../../infrastructure/bcrypt.service';
import { LoginModel } from '../../api/models/input/login.model';
import { AuthService } from '../auth.service';
import { DeviceService } from '../../../devices/application/device.service';
import { RedisService } from 'apps/gateway/src/support.modules/redis/redis.service';
import { parseTimeToSeconds } from '../../../../../common/utils/parseTime';

const throwError = InterlayerNotice.createErrorNotice(
  AuthError.WRONG_CRED,
  ENTITY_USER,
  400
)
interface LoginWithDevice extends LoginModel {
  ip: string,
  title: string
}

export class LoginCommand {
  constructor(public loginModel: LoginWithDevice) { }
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private userPrismaRepository: UsersPrismaRepository,
    private bcryptService: BcryptService,
    private authService: AuthService,
    private deviceService: DeviceService,
    private readonly redisService: RedisService,

  ) {
  }

  async execute(command: LoginCommand) {
    const { email, password, ip, title } = command.loginModel;
    const u = await this.userPrismaRepository.findUserByEmail(email);
    if (!u) return throwError

    const checkPassword = await this.bcryptService.checkPassword(password, u.passwordHash)
    if (!checkPassword) return throwError;
    let d = null
    const updatedAt = new Date()
    d = await this.deviceService.find({ ip, title, userId: u.id, updatedAt })
    if (!d) {
      d = await this.deviceService.createDevice({ ip, title, userId: u.id })
    }

    d = await this.deviceService.update({ ...d, updatedAt })

    const [accessToken, refreshToken] = await Promise.all(
      [
        await this.authService.createToken({
          userId: u.id,
          deviceId: d.id,
          updatedAt
        }, 'ACCESS'),
        await this.authService.createToken({
          userId: u.id,
          deviceId: d.id,
          updatedAt
        }, 'REFRESH')
      ])
    const exp = await this.authService.getExpiration('ACCESS')
    const expSeconds = parseTimeToSeconds(exp)
    await this.redisService.set(accessToken, d, expSeconds)
    console.log(await this.redisService.showAll(''))
    return { accessToken, refreshToken };

  }

}