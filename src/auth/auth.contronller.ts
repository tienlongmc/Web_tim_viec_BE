import { Controller, Get, Post, Render, UseGuards, Body, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Request,response,Response } from 'express';
import { IUser } from 'src/users/user.interface';
import { JwtAuthGuard } from './jwt-auth.guard';
import { request } from 'http';

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


  @Public()
  @ResponseMessage("Get User{{ refresh")
  @Get('/refresh')
  handleRefreshToken(@Req() request:Request,
  @Res({passthrough:true}) response: Response ) { // req.user
    // console.log("check cookie",request.cookies);
    // const refreshToken = 4;
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken,response);
  }

  @ResponseMessage("logout")
  @Post('/logout')
  handleLogout(@User() user:IUser,
  @Res({passthrough:true}) response: Response ) { // req.user
    return this.authService.logout(response,user);
  }
}
