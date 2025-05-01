import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {JwtModule} from '@nestjs/jwt';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {AuthService} from './auth.service';
import {AuthResolver} from './auth.resolver';
import {User} from '../user/entities/user.entity';
import {AccessToken} from '../access-token/entities/access-token.entity';
import {PassportModule} from '@nestjs/passport';
import {JwtStrategy} from './strategies/jwt.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, AccessToken]),
        PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
            }),
        }),
    ],
    providers: [AuthService, AuthResolver, JwtStrategy],
    exports: [AuthService, JwtModule],
})
export class AuthModule {
}
