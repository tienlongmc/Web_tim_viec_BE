import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/user.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService, 
        private configService: ConfigService
    ) {}


    //username vs password là 2 tham số thư viện passport ném về
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        
        if(user){
            const isValid = this.usersService.IsValidPassword(pass,user.password);
            if (isValid === true) {  // Chỉ cần kiểm tra isValid
                return user;
            }
        }
        return null;
      }

    async login(user: IUser,response: Response) {
        const { _id, name, email, role } = user; 
        const payload = {
        sub: "token login",
        iss: "from server",
        _id, name, email, role
        };
        const refreshToken = this.createRefreshToken(payload);
        await this.usersService.updateUserToken(refreshToken, _id)

        // set refreshtoken as cookies để server đọc được thôi
        response.cookie('refresh_token', refreshToken,{
            httpOnly:true,
            maxAge:ms(this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRE")) // 1 ngày
        })

        return {
            // data:{
                access_token: this.jwtService.sign(payload),
                refreshToken,
                  user: {
                            _id, name, email, role
                         }     
        // }
        };
    }

    async register(user: RegisterUserDto) {
        let newUser = await this.usersService.register(user);
        return {
            _id:newUser?.id, // nếu user null thì k bị lỗi
            createdAt:newUser?.createdAt
        };
    }
    createRefreshToken = (payload:any)=> {
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            expiresIn: ms(this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRE")) / 1000
        });
        return refreshToken;
    }

    processNewToken = async (refreshToken: string, response: Response) => {
        try {
            this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET")
            });
            let user = await this.usersService.findUserByToken(refreshToken);
            if (user) {
                const { _id, name, email, role } = user;
                const payload = {
                    sub: "token refresh",
                    iss: "from server",
                    _id, name, email, role
                };
                const refreshToken = this.createRefreshToken(payload);
                await this.usersService.updateUserToken(refreshToken, _id.toString())
                response.clearCookie('refresh_token');
                // set refreshtoken as cookies để server đọc được thôi
                response.cookie('refresh_token', refreshToken,{
                    httpOnly:true,
                    maxAge:ms(this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRE"))*1000 // 1 ngày
                })
                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        _id, name, email, role
                    }
                };
            }
        } catch (error) {
            throw new Error('Refresh token is invalid');
        }
    }
    logout = async (response: Response, user: IUser) => {
        response.clearCookie('refresh_token');
        await this.usersService.updateUserToken('', user._id);
        return 'ok';
    }
}
