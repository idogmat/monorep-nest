import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserCreateModel } from '../../api/models/input/user.create.model';
import { UsersPrismaRepository } from '../../../users/infrastructure/prisma/users.prisma.repository';
import { InterlayerNotice } from '../../../../../common/error-handling/interlayer.notice';
import { AuthError } from '../../../../../common/error-handling/auth.error';
import { ENTITY_USER } from '../../../../../common/entities.constants';
import { BcryptService } from '../../infrastructure/bcrypt.service';

import { EmailService } from '../../../../../common/email/email.service';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
export class SignupCommand {
  constructor(public createInputUser: UserCreateModel) { }
}

@CommandHandler(SignupCommand)
export class SignupUseCase implements ICommandHandler<SignupCommand> {
  constructor(private userPrismaRepository: UsersPrismaRepository,
    private bcryptService: BcryptService,
    private emailService: EmailService) {
  }

  async execute(command: SignupCommand) {

    const { login, password, email } = command.createInputUser;
    const foundUser = await this.userPrismaRepository.findUserByEmail(email);
    if (foundUser) {
      return InterlayerNotice.createErrorNotice(
        AuthError.EMAIL_ALREADY_REGISTERED,
        ENTITY_USER,
        400
      )
    }

    //create hash
    const passwordHash = await this.bcryptService.generationHash(
      password,
    );
    const userDto = this.createUserDTO(login, email, passwordHash);

    const user = await this.userPrismaRepository.createUser(userDto);

    //TODO move send email to event handler
    try {
      this.emailService.sendRegisrtationEmail(
        command.createInputUser.email,
        user.confirmationCode,
      );
    } catch (e: unknown) {
      console.error('Send email error', e);
    }

    return new InterlayerNotice(null);
  }

  private createUserDTO(login: string, email: string, passwordHash: string): CreateUserData {
    return {
      name: login,
      email:email,
      passwordHash: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
      confirmationCode: randomUUID(),
      codeExpiration: add(new Date(), { hours: 24 }),
      isConfirmed: false,
    }
  }
}