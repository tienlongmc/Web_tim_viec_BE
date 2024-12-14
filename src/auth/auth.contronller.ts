import { Controller, Get, Post, Render, UseGuards, Body, Res, Req, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
// import { Request,response,Response } from 'express';
import { IUser } from 'src/users/user.interface';
import { JwtAuthGuard } from './jwt-auth.guard';
import { request } from 'http';
import { RolesService } from 'src/roles/roles.service';

@Controller("auth")//route
export class AuthController {
  constructor(
    private authService: AuthService,
    private roleService: RolesService
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
  async handleGetAccount(@User() user :IUser) { // req.user
    const temp = await this.roleService.findOne(user.role._id) as any;
    user.permissions = temp.permissions;
    return {user};
  }


  @Public()
  @ResponseMessage("Get User by refresh_token")
  @Get('/refresh')
  handleRefreshToken(@Req() request:Request,
  @Res({passthrough:true}) response: Response ) { // req.user
    // console.log("check cookie",request.cookies);
    // const refreshToken = "acdss";
    // const refreshToken = request.cookies["refresh_token"];
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    return this.authService.processNewToken(refreshToken,response);
  }

  @ResponseMessage("logout")
  @Post('/logout')
  handleLogout(@User() user:IUser,
  @Res({passthrough:true}) response: Response ) { // req.user
    return this.authService.logout(response,user);
  }
}
