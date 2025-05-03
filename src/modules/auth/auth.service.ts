import {Injectable, UnauthorizedException} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {User} from '../user/entities/user.entity';
import {UserService} from "../user/user.service";
import {TokenService} from "./token.service";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
    ) {
    }

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid user');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

    async login(user: User) {
        const payload = {sub: user.id, email: user.email, role: user.role};

        const {accessToken, refreshToken, accessTokenExpiresIn} = this.tokenService.generateTokens(payload);

        await this.tokenService.revokeToken(user.id);

        await this.tokenService.saveToken(user.id, accessToken, accessTokenExpiresIn);

        return {
            accessToken,
            refreshToken,
            role: user.role,
        };
    }

    async logout(userId: string, token: string): Promise<boolean> {
        // Find the token in the database
        const accessToken = await this.tokenService.findByToken(token);

        // If token exists and belongs to the user, invalidate it
        if (accessToken && accessToken.userId === userId) {
            await this.tokenService.revokeToken(accessToken.id);
            return true;
        }

        return false;
    }
}
