import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersPrismaRepository } from '../../../users/infrastructure/prisma/users.prisma.repository';
import { InterlayerNotice } from '../../../../../common/error-handling/interlayer.notice';
import { AuthError } from '../../../../../common/error-handling/auth.error';
import { ENTITY_USER } from '../../../../../common/entities.constants';
import { BcryptService } from '../../infrastructure/bcrypt.service';
import { LoginModel } from '../../api/models/input/login.model';
import { AuthService } from '../auth.service';

const throwError = InterlayerNotice.createErrorNotice(
  AuthError.WRONG_CRED,
  ENTITY_USER,
  400
)
export class LoginCommand {
  constructor(public loginModel: LoginModel) { }
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private userPrismaRepository: UsersPrismaRepository,
    private bcryptService: BcryptService,
    private authService: AuthService
  ) {
  }

  async execute(command: LoginCommand) {
    const { email, password } = command.loginModel;
    const u = await this.userPrismaRepository.findUserByEmail(email);
    if (!u) return throwError

    const checkPassword = await this.bcryptService.checkPassword(password, u.passwordHash)
    if (!checkPassword) return throwError;

    const [accessToken, refreshToken] = await Promise.all(
      [
        await this.authService.createToken({
          userId: u.id,
        }, 'ACCESS'),
        await this.authService.createToken({
          userId: u.id,
        }, 'REFRESH')
      ])

    return { accessToken, refreshToken };

  }

}