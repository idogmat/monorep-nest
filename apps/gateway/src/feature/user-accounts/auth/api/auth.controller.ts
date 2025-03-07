import { Controller,  Post, Body } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { UserCreateModel } from './models/input/user.create.model';
import { CommandBus } from '@nestjs/cqrs';
import { SignupCommand } from '../application/use-cases/signup.use.case';
import { ErrorProcessor } from '../../../../common/error-handling/error.processor';

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

  // @Get()
  // async findAll() {
  //   return this.usersService.getAllUsers();
  // }
}