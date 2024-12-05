import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import cookieParser from 'cookie-parser';
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  // cau hinh guard JWT
  const a = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(a));

  app.useStaticAssets(join(__dirname, '..', 'public')); //truy cap js css img
  app.setBaseViewsDir(join(__dirname, '..', 'view'));// view 

  app.setViewEngine('ejs');
  app.useGlobalPipes(new ValidationPipe());

  //config cookie
  app.use(cookieParser());
  
// congif cors
  app.enableCors({
    "origin": "*", // cho phép nơi nào có thể kết nối tới
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  }
  );
  await app.listen(configService.get<string>('PORT'));
  const reflector = app.get( Reflector );
  app.useGlobalGuards( new JwtAuthGuard( reflector ) );
}
bootstrap();
