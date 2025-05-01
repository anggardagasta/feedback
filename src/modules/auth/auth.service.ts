import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import {User} from '../user/entities/user.entity';
import {AccessToken} from '../access-token/entities/access-token.entity';

dayjs.extend(duration);

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(AccessToken)
        private tokenRepo: Repository<AccessToken>,
        private jwtService: JwtService,
    ) {
    }

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.userRepo.findOne({where: {email}});
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

        const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES || '7d';
        const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES || '14d';

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: accessTokenExpiresIn,
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: refreshTokenExpiresIn,
        });

        await this.tokenRepo.save(
            this.tokenRepo.create({
                userId: user.id,
                token: accessToken,
                isValid: true,
                expiresAt: await this.parseExpiryToDate(accessTokenExpiresIn),
            }),
        );

        return {
            accessToken,
            refreshToken,
            role: user.role,
        };
    }

    async parseExpiryToDate(expiry: string): Promise<Date> {
        const regex = /^(\d+)([smhd])$/;
        const match = expiry.match(regex);

        if (!match) {
            throw new Error('Invalid expiry format (e.g. 7d, 1h, 30m)');
        }

        const value = parseInt(match[1], 10);
        const unitChar = match[2] as 's' | 'm' | 'h' | 'd';
        // const unit = match[2] as 's' | 'm' | 'h' | 'd';

        const unitMap: Record<string, dayjs.ManipulateType> = {
            s: 'seconds',
            m: 'minutes',
            h: 'hours',
            d: 'days',
        };

        const unit = unitMap[unitChar];

        return dayjs().add(value, unit).toDate();

    }
}
