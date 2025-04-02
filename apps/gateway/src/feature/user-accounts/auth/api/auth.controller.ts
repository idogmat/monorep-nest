import { Controller, Post, Body, Get, Query, HttpCode, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { UserCreateModel } from './models/input/user.create.model';
import { CommandBus } from '@nestjs/cqrs';
import { SignupCommand } from '../application/use-cases/signup.use.case';
import { ErrorProcessor } from '../../../../common/error-handling/error.processor';
import { EmailRecovery, EmailVerify, VerifyEmailToken } from './models/input/email.model';
import { VerifyEmailCommand } from '../application/use-cases/verify.email.case';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthError } from '../../../../common/error-handling/auth.error';
import { LoginModel } from './models/input/login.model';
import { LoginCommand } from '../application/use-cases/login.case';
import { RecoveryModel } from './models/input/recovery.model';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthMeOutputMapper, AuthMeOutputModel } from './models/output/auth-me.model';
import { GoogleTokenModel } from './models/input/google.token.model';
import { OauthGoogleCommand } from '../application/use-cases/oauth.google.use.case';
import { GithubService } from '../../../../common/provider/github.service';
import { GithubTokenModel } from './models/input/github.token.model';
import { GithubAuthCallbackCommand } from '../application/use-cases/github.auth.callback.use.case';
import { AuthGuard } from '../../../../common/guard/authGuard';
import { DeviceInfoDto } from './models/shared/device.info.dto';
import { RedisService } from '../../../../support.modules/redis/redis.service';

interface ICookieSettings {
  httpOnly: boolean,
  secure: boolean,
  sameSite: string,
  domain: string,
  path: string
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  COOKIE_SETTINGS: ICookieSettings
  constructor(
    private commandBus: CommandBus,
    private readonly authService: AuthService,
    private readonly githubService: GithubService,
  ) {
    // const isLocal = this.configService.get<string>('NODE_ENV') === 'DEVELOPMENT'
    this.COOKIE_SETTINGS = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.myin-gram.ru',
      path: '/'
    }
  }

  @Post('signup')
  async signup(@Body() createInputUser: UserCreateModel) {
    const result = await this.commandBus.execute(
      new SignupCommand(createInputUser),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }

  @UseGuards(ThrottlerGuard)
  @Post('login')
  async login(
    @Req() req,
    @Res() res,
    @Body() loginModel: LoginModel
  ) {
    const browser = (req.get("user-agent") || 'null').toString();
    const ip = (req.ip || req.headers["x-forwarded-for"] || 'null').toString();

    const result = await this.commandBus.execute(
      new LoginCommand({ ...loginModel, title: browser, ip }),
    );
    if (result?.hasError?.()) {
      new ErrorProcessor(result).handleError();
    }
    const { accessToken, refreshToken } = result
    res.cookie("refreshToken", refreshToken, this.COOKIE_SETTINGS);
    res.status(200).send({ accessToken });
  }

  @ApiResponse({ status: 200, type: AuthMeOutputModel })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('me')
  async authMe(
    @Req() req,
  ) {
    const u = await this.authService.getById(req.user.userId)
    return AuthMeOutputMapper(u)
  }

  @ApiResponse({ status: 204, description: 'Email has been successfully confirmed.' })
  @ApiResponse({ status: 400, description: AuthError.CONFIRMATION_ERROR })
  @UseGuards(ThrottlerGuard)
  @Get('verify-email')
  async verifyEmail(@Query() query: VerifyEmailToken) {
    const result = await this.commandBus.execute(
      new VerifyEmailCommand(query),
    );
    if (result.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }

  @ApiResponse({ status: 204, description: 'Email has been successfully confirmed.' })
  @ApiResponse({ status: 400, description: AuthError.CONFIRMATION_ERROR })
  @HttpCode(204)
  @UseGuards(ThrottlerGuard)
  @Post('verify-resend')
  async resendVerifyCode(@Body() recovery: EmailVerify) {
    const { email } = recovery
    const result = await this.authService.sendVerifyEmail(email)
    if (result?.hasError()) {
      new ErrorProcessor(result).handleError();
    }
  }

  @ApiResponse({ status: 204, description: 'Your Email has a recovery code.' })
  @ApiResponse({ status: 400, description: AuthError.CONFIRMATION_ERROR })
  @HttpCode(204)
  @UseGuards(ThrottlerGuard)
  @Post('forgot-password')
  async recoveryPassword(@Body() recovery: EmailRecovery) {
    const { email, recaptchaToken } = recovery
    const result = await this.authService.sendRecoveryCode(email, recaptchaToken)
    if (result?.hasError?.()) {
      new ErrorProcessor(result).handleError();
    }
  }

  @ApiResponse({ status: 204, description: 'Your new password is set.' })
  @ApiResponse({ status: 400, description: AuthError.CONFIRMATION_ERROR })
  @HttpCode(204)
  @UseGuards(ThrottlerGuard)
  @Post('reset-password')
  async setNewPassword(@Body() newCreds: RecoveryModel) {
    const { recoveryCode, password } = newCreds
    const result = await this.authService.setNewPassword(recoveryCode, password)
    if (result?.hasError?.()) {
      new ErrorProcessor(result).handleError();
    }
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async logout(
    @Req() req,
    @Res() res
  ) {
    res.clearCookie("refreshToken", this.COOKIE_SETTINGS);
    res.sendStatus(204);
  }

  @Post('google')
  @HttpCode(204)
  async oauthGoogle(
    @Req() req,
    @Res() res,
    @Body() googleToken: GoogleTokenModel
  ) {

    const browser = (req.get("user-agent") || 'null').toString();
    const ip = (req.ip || req.headers["x-forwarded-for"] || 'null').toString();
    const result = await this.commandBus.execute(
      new OauthGoogleCommand({ ...googleToken, title: browser, ip }),
    );
    if (result?.hasError?.()) {
      new ErrorProcessor(result).handleError();
    }
    const { accessToken, refreshToken } = result.data;
    res.cookie("refreshToken", refreshToken, this.COOKIE_SETTINGS);
    res.status(200).send({ accessToken });

  }

  @Get('github')
  @HttpCode(204)
  async oauthGithub(
    @Res() res,
  ) {
    return res.redirect(this.githubService.githubAuth())

  }

  @Get('github/callback')
  async githubAuthCallback(
    @Req() req,
    @Res() res,
    @Query() queryDto: GithubTokenModel
  ) {

    const deviceInfo = new DeviceInfoDto(
      req.get("user-agent")?.toString() || 'null',
      req.ip?.toString() || req.headers["x-forwarded-for"]?.toString() || 'null'
    );
    const result = await this.commandBus.execute(
      new GithubAuthCallbackCommand(queryDto, deviceInfo),
    );
    if (result.hasError?.()) {
      new ErrorProcessor(result).handleError();
    }
    const { accessToken, refreshToken, baseURL } = result.data;

    res.cookie("refreshToken", refreshToken, this.COOKIE_SETTINGS);
    res.redirect(`${baseURL}?accessToken=${accessToken}`);

  }
}