import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // lay token tu header
      ignoreExpiration: false,
      secretOrKey : configService.get<string>("JWT_ACCESS_TOKEN")
    });
  }

  async validate(payload: IUser) {
    try {
    const { _id, name, email, role,company,age,address } = payload; 
    // req.user
    return {
    _id, name, email, role,company,age,address
    };
  } catch (error) {
    throw new UnauthorizedException('Token validation failed');
  }
    }
    
}