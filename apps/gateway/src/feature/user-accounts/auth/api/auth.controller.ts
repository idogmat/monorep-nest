import { Controller, Post, Body, Get, Query, HttpCode, Req, Res } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { UserCreateModel } from './models/input/user.create.model';
import { CommandBus } from '@nestjs/cqrs';
import { SignupCommand } from '../application/use-cases/signup.use.case';
import { ErrorProcessor } from '../../../../common/error-handling/error.processor';
import { EmailRecovery, VerifyEmailToken } from './models/input/email.model';
import { VerifyEmailCommand } from '../application/use-cases/verify.email.case';
import { ApiResponse } from '@nestjs/swagger';
import { AuthError } from '../../../../common/error-handling/auth.error';
import { LoginModel } from './models/input/login.model';
import { LoginCommand } from '../application/use-cases/login.case';
import { RecoveryModel } from './models/input/recovery.model';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private readonly authService: AuthService) { }

  @Post('signup')
  async signup(@Body() createInputUser: UserCreateModel) {
    const result = await this.commandBus.execute(
      new SignupCommand(createInputUser),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }

  @Post('login')
  async login(
    @Req() req,
    @Res() res,
    @Body() loginModel: LoginModel
  ) {
    const result = await this.commandBus.execute(
      new LoginCommand(loginModel),
    );
    if (result?.hasError?.()) {
      new ErrorProcessor(result).handleError();
    }
    const { accessToken, refreshToken } = result
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(200).send({ accessToken });
  }

  @ApiResponse({ status: 200, description: 'Email has been successfully confirmed.', type: VerifyEmailToken })
  @ApiResponse({ status: 400, description: AuthError.CONFIRMATION_ERROR })
  @Get('verify-email')
  async verifyEmail(@Query() query: VerifyEmailToken) {
    const result = await this.commandBus.execute(
      new VerifyEmailCommand(query),
    );
    if (result?.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }

  @ApiResponse({ status: 200, description: 'Email has been successfully confirmed.', type: VerifyEmailToken })
  @ApiResponse({ status: 400, description: AuthError.CONFIRMATION_ERROR })
  @HttpCode(200)
  @Post('verify-resend')
  async resendVerifyCode(@Body() recovery: EmailRecovery) {
    const { email } = recovery
    await this.authService.sendVerifyEmail(email)
  }

  @ApiResponse({ status: 200, description: 'Your Email has a recovery code.', type: VerifyEmailToken })
  @ApiResponse({ status: 400, description: AuthError.CONFIRMATION_ERROR })
  @HttpCode(200)
  @Post('forgot-password')
  async recoveryPassword(@Body() recovery: EmailRecovery) {
    const { email } = recovery
    await this.authService.sendRecoveryCode(email)
  }

  @ApiResponse({ status: 200, description: 'Your new password is set.', type: VerifyEmailToken })
  @ApiResponse({ status: 400, description: AuthError.CONFIRMATION_ERROR })
  @HttpCode(200)
  @Post('reset-password')
  async setNewPassword(@Body() newCreds: RecoveryModel) {
    const { recoveryCode, password } = newCreds
    await this.authService.setNewPassword(recoveryCode, password)
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Req() req,
    @Res() res
  ) {
    res.clearCookie("refreshToken", { httpOnly: true, secure: true });
    res.sendStatus(204);
  }
}