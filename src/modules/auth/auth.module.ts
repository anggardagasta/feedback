import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {JwtModule} from '@nestjs/jwt';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {AuthService} from './auth.service';
import {AuthResolver} from './auth.resolver';
import {AccessToken} from '../access-token/entities/access-token.entity';
import {PassportModule} from '@nestjs/passport';
import {JwtStrategy} from './strategies/jwt.strategy';
import {UserModule} from '../user/user.module';
import {TokenService} from "./token.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([AccessToken]),
        PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
            }),
        }),
        UserModule,
    ],
    providers: [AuthService, AuthResolver, JwtStrategy, TokenService],
    exports: [AuthService, JwtModule, TokenService],
})
export class AuthModule {
}
