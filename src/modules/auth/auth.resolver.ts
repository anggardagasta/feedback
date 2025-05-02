import {Args, Context, Mutation, Resolver} from '@nestjs/graphql';
import {AuthService} from './auth.service';
import {LoginInput} from './dto/login.input';
import {LoginResponse} from './dto/login.response';
import {UseGuards} from "@nestjs/common";
import {JwtAuthGuard} from "./guards/jwt-auth.guard";

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) {
    }

    @Mutation(() => LoginResponse)
    async login(@Args('input') input: LoginInput): Promise<LoginResponse> {
        const user = await this.authService.validateUser(input.email, input.password);
        return this.authService.login(user);
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    async logout(@Context() context: any): Promise<boolean> {
        const userId = context.req.user.id;
        const token = context.req.headers.authorization?.split(' ')[1];

        if (!token) {
            return false;
        }

        return this.authService.logout(userId, token);
    }
}
