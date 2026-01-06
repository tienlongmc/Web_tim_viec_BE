import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/user.interface';
import { CodeAuthDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { Response } from 'express';
import { RolesService } from 'src/roles/roles.service';
import { Permission } from 'src/permissions/schema/permission.schema';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rolesService: RolesService,
  ) {}

  //username vs password là 2 tham số thư viện passport ném về
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    console.log('user ben auth ser: ', user);

    if (user) {
      const isValid = this.usersService.IsValidPassword(pass, user.password);

      if (isValid === true) {
        // Chỉ cần kiểm tra isValid
        return user;
      }
    }
    return null;
  }

  async login(user: IUser, response: Response) {
    const {
      _id,
      name,
      email,
      role,
      company,
      permissions,
      isActive,
      age,
      address,
      avatar,
      connected,
    } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
      company,
      isActive,
      age,
      address,
      avatar,
      connected,
    };
    const refreshToken = this.createRefreshToken(payload);
    await this.usersService.updateUserToken(refreshToken, _id);
    const userRole = user.role as unknown as { _id: string; name: string };
    const temp = await this.rolesService.findOne(userRole._id);
    const refreshTokenExpire = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRE',
    )!;
    console.log('refreshTokenExpire: ', refreshTokenExpire);
    const maxAgeMs: number = ms(refreshTokenExpire as StringValue)!; // Chuyển đổi chuỗi thời gian thành milliseconds
    // set refreshtoken as cookies để server đọc được thôi
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: maxAgeMs, // 1 ngày
      secure: false, // hoặc true nếu dùng HTTPS
      sameSite: 'lax', // hoặc 'none' nếu frontend/backend khác domain + HTTPS
    });

    return {
      // data:{
      access_token: this.jwtService.sign(payload),
      refreshToken,
      user: {
        _id,
        name,
        email,
        role,
        company,
        permission: temp?.permissions ?? [],
        isActive,
        age,
        address,
        avatar,
        connected,
      },
      // }
    };
  }

  async register(user: RegisterUserDto) {
    let newUser = await this.usersService.register(user);
    return {
      _id: newUser?.id, // nếu user null thì k bị lỗi
      createdAt: newUser?.createdAt,
    };
  }

  async checkcode(codeAuthDto: CodeAuthDto) {
    let newUser = await this.usersService.handeActive(codeAuthDto);
    return {
      _id: newUser?.id, // nếu user null thì k bị lỗi
      createdAt: newUser?.createdAt,
    };
  }
  createRefreshToken = (payload: any) => {
    const refreshTokenExpire = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRE',
    )!;
    const maxAgeMs: number = ms(refreshTokenExpire as StringValue)!; // Chuyển đổi chuỗi thời gian thành milliseconds
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: maxAgeMs / 1000,
    });
    return refreshToken;
  };

  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      let user = await this.usersService.findUserByToken(refreshToken);
      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'token refresh',
          iss: 'from server',
          _id,
          name,
          email,
          role,
        };
        const refreshToken = this.createRefreshToken(payload);
        await this.usersService.updateUserToken(refreshToken, _id.toString());
        response.clearCookie('refresh_token');
        const refreshTokenExpire = this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRE',
        )!;
        const maxAgeMs: number = ms(refreshTokenExpire as StringValue)!; // Chuyển đổi chuỗi thời gian thành milliseconds
        // set refreshtoken as cookies để server đọc được thôi
        response.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          maxAge: maxAgeMs * 1000, // 1 ngày
        });
        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            role,
          },
        };
      }
    } catch (error) {
      throw new Error('Refresh token is invalid');
    }
  };

  logout = async (response: Response, user: IUser) => {
    response.clearCookie('refresh_token');
    await this.usersService.updateUserToken('', user._id);
    return 'ok';
  };

  async validateGoogleUser(googleUser: RegisterUserDto) {
    return await this.usersService.register(googleUser);
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      // Giải mã refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Tìm user theo ID trong token
      const user = await this.usersService.findOneByUsername(payload.email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Tạo access token mới
      const newAccessToken = this.jwtService.sign(
        { _id: user._id, name: user.name, email: user.email, role: user.role },
        {
          expiresIn: '1h',
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );

      return { access_token: newAccessToken, user };
    } catch (error) {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }
}
