import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/user.interface';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private roleService: RolesService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // lay token tu header
      ignoreExpiration: false,
      secretOrKey : configService.get<string>("JWT_ACCESS_TOKEN")
    });
  }

  async validate(payload: IUser) {
    try {
    const { _id, name, email, role } = payload; 
      // gán thêm permission vào req.user
      const userRole = role as unknown as { _id: string, name: string };
      const temp = (await this.roleService.findOne(userRole._id)).toObject();

    // req.user
    return {
    _id, name, email, role, permissions: temp?.permissions??[]
    };
  } catch (error) {
    throw new UnauthorizedException('Token validation failed');
  }
    }
    
}