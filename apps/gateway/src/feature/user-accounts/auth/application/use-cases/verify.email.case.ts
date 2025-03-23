import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyEmailToken } from '../../api/models/input/email.model';
import { InterlayerNotice } from '../../../../../common/error-handling/interlayer.notice';
import { ENTITY_USER } from '../../../../../common/entities.constants';
import { AuthError } from '../../../../../common/error-handling/auth.error';
import { UsersPrismaRepository } from '../../../users/infrastructure/prisma/users.prisma.repository';

export class VerifyEmailCommand {
  constructor(public confirmToken: VerifyEmailToken) { }
}

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailUseCase implements ICommandHandler<VerifyEmailCommand> {
  constructor(private userPrismaRepository: UsersPrismaRepository) {
  }

  async execute(command: VerifyEmailCommand): Promise<InterlayerNotice> {
    try {
      const { token } = command.confirmToken;
      const u = await this.userPrismaRepository.findUserByConfirmationCode(token);
      if (u.codeExpiration && new Date(u.codeExpiration) <= new Date())
        return InterlayerNotice.createErrorNotice(
          AuthError.CONFIRMATION_EXPIRED,
          ENTITY_USER,
          400
        );
      if (!u)
        return InterlayerNotice.createErrorNotice(
          AuthError.CONFIRMATION_ERROR,
          ENTITY_USER,
          400
        );
      u.isConfirmed = true;
      u.confirmationCode = null;
      await this.userPrismaRepository.updateUserById(u.id, u)
      return new InterlayerNotice(null);
    } catch (error: unknown) {
      console.error('Send email error', error);
    }
  }
}