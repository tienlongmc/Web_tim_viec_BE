import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/decorator/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
      }
      canActivate(context: ExecutionContext) {
    //       if (request.method === 'OPTIONS') {
    //   return true;
    // }
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
          context.getHandler(),
          context.getClass(),
        ]); // lấy ra metadate gửi cùng req
        if (isPublic) {
          return true;
        }
        return super.canActivate(context);
      }
    
    
      handleRequest(err, user, info) {
        // You can throw an exception based on either "info" or "err" arguments
        if (err || !user) {
          throw err || new UnauthorizedException("Token không hợp lệ hoặc không có token ở beader token ở header request !");
        }
        return user;
      }
}
