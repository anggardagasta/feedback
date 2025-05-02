import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { AccessToken } from '../access-token/entities/access-token.entity';

dayjs.extend(duration);

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(AccessToken)
        private tokenRepo: Repository<AccessToken>,
        private jwtService: JwtService,
    ) {}

    generateTokens(payload: { sub: string; email: string; role: string }) {
        const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES || '7d';
        const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES || '14d';

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: accessTokenExpiresIn,
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: refreshTokenExpiresIn,
        });

        return { accessToken, refreshToken, accessTokenExpiresIn };
    }

    async saveToken(userId: string, token: string, expiryString: string): Promise<void> {
        await this.tokenRepo.save(
            this.tokenRepo.create({
                userId,
                token,
                isValid: true,
                expiresAt: await this.parseExpiryToDate(expiryString),
            }),
        );
    }

    async parseExpiryToDate(expiry: string): Promise<Date> {
        const regex = /^(\d+)([smhd])$/;
        const match = expiry.match(regex);

        if (!match) {
            throw new Error('Invalid expiry format (e.g. 7d, 1h, 30m)');
        }

        const value = parseInt(match[1], 10);
        const unitChar = match[2] as 's' | 'm' | 'h' | 'd';

        const unitMap: Record<string, dayjs.ManipulateType> = {
            s: 'seconds',
            m: 'minutes',
            h: 'hours',
            d: 'days',
        };

        const unit = unitMap[unitChar];

        return dayjs().add(value, unit).toDate();
    }

    async findByToken(token: string): Promise<AccessToken | null> {
        return this.tokenRepo.findOne({
            where: { token }
        });
    }

    async revokeToken(userId: string): Promise<void> {
        // Find all valid tokens for this user
        const tokens = await this.tokenRepo.find({
            where: {
                userId,
                isValid: true,
            },
        });

        // Update all tokens to be invalid and set expiredAt to now
        if (tokens.length > 0) {
            await Promise.all(
                tokens.map(token =>
                    this.tokenRepo.update(
                        { id: token.id },
                        {
                            isValid: false,
                            expiresAt: new Date()
                        }
                    )
                )
            );
        }
    }
}