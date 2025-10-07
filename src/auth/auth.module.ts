import { Module, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './passport/jwt.strategy';
import ms, { StringValue } from 'ms';
import { AuthController } from './auth.contronller'; // sửa tên đúng
import { RolesModule } from 'src/roles/roles.module';
import googleOauthConfig from './google/google-oauth.config';
import { GoogleStrategy } from './passport/google.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    RolesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_ACCESS_TOKEN');
        const expireStr = configService.get<string>('JWT_ACCESS_EXPIRE');

        if (!secret) throw new InternalServerErrorException('JWT_ACCESS_TOKEN is not set');
        if (!expireStr) throw new InternalServerErrorException('JWT_ACCESS_EXPIRE is not set');
        const expireMs: number = ms(expireStr as StringValue);
        return {
          secret,
          signOptions: {
            expiresIn: expireMs, // TypeScript sẽ không còn báo lỗi
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forFeature(googleOauthConfig),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule { }
