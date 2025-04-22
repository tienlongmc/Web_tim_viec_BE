import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import googleOauthConfig from "../google/google-oauth.config";
import { VerifiedCallback } from "passport-jwt";
import { AuthService } from "../auth.service";
import { ConfigType } from "@nestjs/config";
import { UsersService } from "src/users/users.service";
// const test = new Strategy({
//     clientID:,
//     clientSecret:,
//     callbackURL:,
//     scope:
// })


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy){
    constructor(
        private authService: AuthService,
        private userService: UsersService,
        @Inject(googleOauthConfig.KEY)
        private googleConfiguration: ConfigType<typeof googleOauthConfig>,
    ){
        super({
            clientID:googleConfiguration.clinetID,
            clientSecret:googleConfiguration.clientSecret,
            callbackURL:googleConfiguration.callbackURL,
            scope:[
                "email","profile"
            ]
        });
    }
    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
      ) {

        let user = await this.userService.findOneByUsername(profile.emails[0].value);
    
    if (!user) {
        console.log({ profile });
        const userDto = {
            email: profile.emails[0].value, // Lấy email từ Google
            password: '', // Google OAuth không có password, nên để trống
            name: `${profile.name.givenName} ${profile.name.familyName}`, // Ghép FirstName + LastName
            age: null, // Google OAuth không cung cấp tuổi, có thể yêu cầu nhập sau
            gender: profile.gender || 'Not specified', // Google có thể có hoặc không có gender
            address: '', // Google không cung cấp địa chỉ, có thể yêu cầu nhập sau
            avatar: profile.photos?.[0]?.value || '', 
          };
          
          user = await this.authService.validateGoogleUser(userDto);
      }
          return user;
          


        // const user = await this.authService.validateGoogleUser({
        //   email: profile.emails[0].value,
        //   firstName: profile.name.givenName,
        //   lastName: profile.name.familyName,
        //   avatarUrl: profile.photos[0].value,
        //   password: '',
        // });
        // // done(null, user);
        // return user;
      }
    }