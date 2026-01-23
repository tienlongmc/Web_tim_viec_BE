// main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import cookieParser from 'cookie-parser';
import { TransformInterceptor } from './core/transform.interceptor';

// load environment variables
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.disable('etag'); 
    app.enableCors({
    origin: '*',
    credentials: true,
  });
   app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  const reflector = app.get(Reflector);
//   app.enableCors({
//   origin: [
//     'https://webtimviec.online',
//     'http://localhost:3000',
//     /\.vercel\.app$/,
//   ],

//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',

//   allowedHeaders: [
//     'Content-Type',
//     'Authorization',
//     'folder_type',
//     'Accept',
//   ],

//   // ❌ KHÔNG credentials vì bạn không dùng cookie
//   // credentials: true,

//   optionsSuccessStatus: 204,
// });
  
  // mới
  const configService = app.get(ConfigService);
  // const reflector = app.get(Reflector);
  //   app.use((req, res, next) => {
  //   res.setHeader('Cache-Control', 'no-store');
  //   next();
  // });
  //đến đây

  // JWT Guard
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Static files & views
  app.useStaticAssets(join(__dirname, '..', 'public')); // truy cập js, css, img
  app.setBaseViewsDir(join(__dirname, '..', 'view')); // view directory
  app.setViewEngine('ejs');

  // Global pipes & interceptors
  // app.useGlobalPipes(new ValidationPipe());
    app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // Cookie parser
  app.use(cookieParser());

  // CORS config
  // app.enableCors({
  //   // origin: true,
  //   origin: [
  //     'https://webtimviec.online',
  //     'http://localhost:3000',
  //     'https://webtimviecfev2.vercel.app',
  //   ],
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   // preflightContinue: false,
  //   // optionsSuccessStatus: 204,
  //   allowedHeaders: ['Content-Type', 'Authorization', 'folder_type'],
  //   credentials: true,
  // });



// app.enableCors({
//     // origin: true,
//     origin: ['https://webtimviec.online', 'http://localhost:3000', 'https://webtimviecfev2.vercel.app'],
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     preflightContinue: false,
//     optionsSuccessStatus: 204,
//     allowedHeaders: ['Content-Type', 'Authorization', 'folder_type'],
//     credentials: true,
//   });
  // Global prefix & API versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2'],
  });

  // Start server
  await app.listen(configService.get<number>('PORT') || 3000);
}

bootstrap();
