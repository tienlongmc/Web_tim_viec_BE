import {
  Controller,
  Get,
  Post,
  Render,
  UseGuards,
  Body,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { CodeAuthDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
// import { Request,response,Response } from 'express';
import { IUser } from 'src/users/user.interface';
import { JwtAuthGuard } from './jwt-auth.guard';
import { request } from 'http';
import { RolesService } from 'src/roles/roles.service';
import { GoogleAuthGuard } from './google-auth/google-auth.guard';
import { access } from 'fs';
import { AuthGuard } from '@nestjs/passport';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';

@Controller('auth') //route
export class AuthController {
  constructor(
    private authService: AuthService,
    private roleService: RolesService,
    private userService: UsersService,
  ) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ResponseMessage('User login')
  HandleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  // @UseGuards(JwtAuthGuard)
  @Public()
  @ResponseMessage('Register a new user')
  @Post('/register')
  HandleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Public()
  // @ResponseMessage("Register a new user")
  @Post('/check-code')
  checkCode(@Body() codeAuthDto: CodeAuthDto) {
    return this.authService.checkcode(codeAuthDto);
  }

  @ResponseMessage('Get User information')
  @Get('/account')
  async handleGetAccount(@User() user: IUser) {
    // req.user
    const temp = (await this.roleService.findOne(user.role._id)) as any;
    const fullUser = await this.userService.findOne(user._id) as any;

    user.permissions = temp.permissions;
    user.connected = fullUser.connected;
    // console.log(user.connected)
    return { user };
  }

  @Public()
  @ResponseMessage('Get User by refresh_token')
  @Get('/refresh')
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // req.user
    // console.log("check cookie",request.cookies);
    // const refreshToken = "acdss";
    // const refreshToken = request.cookies["refresh_token"];
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    return this.authService.processNewToken(refreshToken, response);
  }

  @ResponseMessage('logout')
  @Post('/logout')
  handleLogout(
    @User() user: IUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    // req.user
    return this.authService.logout(response, user);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() { }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    const s = await this.authService.login(req.user, response);
    // console.log('hihi1: ', req.user);
    // console.log('hihi: ', s);
    if (s.user.isActive === false) {
      return response.redirect(
        `https://webtimviecfev2.vercel.app/auth/verify/${s.user._id}`,
      );
    }
    response.redirect(`https://webtimviecfev2.vercel.app?token=${s.access_token}`);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) { }

  @Public()
  @Get('token')
  async getAccessToken(@Req() req) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }
    return this.authService.refreshAccessToken(refreshToken);
  }
}
