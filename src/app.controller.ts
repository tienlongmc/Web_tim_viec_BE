import { Controller, Get, Post, Render, UseGuards,Request } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Public } from './decorator/customize';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
    private authService: AuthService,

  ) {}

  // @Get() // api (restful)
  // @Render("home") // tra ve view thi k duoc return //server side engine
  // getHello(){
  //   console.log("check port = ",this.configService.get<string>("PORT"))
  //   const message1 = this.appService.getHello();
  //   return {
  //     message: message1
  //   }
  //   // return" this.appService.getHello()";
  // }


  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
