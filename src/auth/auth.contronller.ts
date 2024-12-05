import { Controller, Get, Post, Render, UseGuards, Body, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Request,Response } from 'express';
import { IUser } from 'src/users/user.interface';

@Controller("auth")//route
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ResponseMessage("User login")
  HandleLogin(@Req() req,
  @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user,response);
  }

  // @UseGuards(JwtAuthGuard)
  @Public()
  @ResponseMessage("Register a new user")
  @Post('/register')
  HandleRegister(@Body() registerUserDto : RegisterUserDto ) {
    return this.authService.register(registerUserDto);
  }

  @ResponseMessage("Get User information")
  @Get('/account')
  handleGetAccount(@User() user :IUser) { // req.user
    return {user};
  }
}
