import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';

import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './passport/jwt.strategy';
import ms from 'ms';
import { AuthController } from './auth.contronller';
import { RolesModule } from 'src/roles/roles.module';
import googleOauthConfig from './google/google-oauth.config';
import { GoogleStrategy } from './passport/google.strategy';


@Module({
  imports:[UsersModule,PassportModule,RolesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN'),
        signOptions: {
            expiresIn: ms(configService.get<string>('JWT_ACCESS_EXPIRE')),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forFeature(googleOauthConfig)

  ],
  providers: [AuthService,LocalStrategy,JwtStrategy,GoogleStrategy],
  exports:[AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
