import {Injectable, ExecutionContext, UnauthorizedException} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {GqlExecutionContext} from '@nestjs/graphql';
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private jwtService: JwtService) {
        super();
    }

    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req;
    }

    handleRequest(err: any, user: any) {
        if (err || !user) {
            throw err || new UnauthorizedException('Authentication required');
        }
        return user;
    }
}