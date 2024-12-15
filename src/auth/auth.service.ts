import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/user.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { RolesService } from 'src/roles/roles.service';
import { Permission } from 'src/permissions/schema/permission.schema';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService, 
        private configService: ConfigService,
        private rolesService:RolesService
    ) {}


    //username vs password là 2 tham số thư viện passport ném về
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        console.log("user ben auth ser: ", user);
        
        if(user){
            const isValid = this.usersService.IsValidPassword(pass,user.password);
            if (isValid === true) {
                  // Chỉ cần kiểm tra isValid
                  const userRole = user.role as unknown as { _id: string, name: string };

                  
                  
                  const temp = await this.rolesService.findOne(userRole._id);
                   const objUser = {
                    ...user.toObject(),
                    permissions: temp?.permissions??[]
                  }

                return objUser;
            }
        }
        return null;
      }

    async login(user: IUser,response: Response) {
        const { _id, name, email, role,permissions } = user; 
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
                            _id, name, email, role,permissions
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

                const userRole = user.role as unknown as { _id: string, name: string };
                  const temp = await this.rolesService.findOne(userRole._id);

                response.clearCookie('refresh_token');
                // set refreshtoken as cookies để server đọc được thôi
                response.cookie('refresh_token', refreshToken,{
                    httpOnly:true,
                    maxAge:ms(this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRE"))*1000 // 1 ngày
                })
                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        _id, name, email, role,permission:temp?.permissions??[]
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
