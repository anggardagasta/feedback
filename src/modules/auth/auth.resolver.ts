import {Args, Mutation, Resolver} from '@nestjs/graphql';
import {AuthService} from './auth.service';
import {LoginInput} from './dto/login.input';
import {LoginResponse} from './dto/login.response';

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) {
    }

    @Mutation(() => LoginResponse)
    async login(@Args('input') input: LoginInput): Promise<LoginResponse> {
        const user = await this.authService.validateUser(input.email, input.password);
        return this.authService.login(user);
    }
}
