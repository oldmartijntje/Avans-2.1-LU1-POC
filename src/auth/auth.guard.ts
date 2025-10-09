import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';

import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './auth.decorator';



@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (token) {
            try {
                const payload = await this.jwtService.verifyAsync(token, {
                    secret: jwtConstants.secret,
                });
                request['user'] = payload; // Populate req.user if token is valid
            } catch {
                if (!isPublic) {
                    throw new UnauthorizedException(); // Reject if not public and token is invalid
                }
            }
        } else if (!isPublic) {
            throw new UnauthorizedException(); // Reject if not public and no token is provided
        }

        return true; // Allow access if public or token is valid
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
