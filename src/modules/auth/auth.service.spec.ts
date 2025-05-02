import {Test, TestingModule} from '@nestjs/testing';
import {AuthService} from './auth.service';
import {UserService} from '../user/user.service';
import {TokenService} from './token.service';
import {UnauthorizedException} from '@nestjs/common';
import {User} from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import {UserRole} from "../user/enums/user-role.enum";

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;

    const mockUserService = {
        findByEmail: jest.fn(),
    };

    const mockTokenService = {
        generateTokens: jest.fn(),
        revokeToken: jest.fn(),
        saveToken: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {provide: UserService, useValue: mockUserService},
                {provide: TokenService, useValue: mockTokenService},
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should return user when credentials are valid', async () => {
            const mockUser = {
                id: '35240617-541a-4124-b68e-fffa3ff62b95',
                email: 'user@email.com',
                password: 'password'
            } as User;
            mockUserService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            // Act
            const result = await service.validateUser('user@email.com', 'password');

            // Assert
            expect(result).toEqual(mockUser);
            expect(mockUserService.findByEmail).toHaveBeenCalledWith('user@email.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('password', 'password');
        });

        it('should throw UnauthorizedException when user not found', async () => {
            // Arrange
            mockUserService.findByEmail.mockResolvedValue(null);

            // Act & Assert
            await expect(service.validateUser('invalid@email.com', 'password'))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when password is invalid', async () => {
            // Arrange
            const mockUser = {
                id: '35240617-541a-4124-b68e-fffa3ff62b95',
                email: 'test@email.com',
                password: 'password'
            } as User;
            mockUserService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // Act & Assert
            await expect(service.validateUser('test@example.com', 'wrong-password'))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe('login', () => {
        it('should generate save and revoke tokens and return login response', async () => {
            const mockUser = {
                id: '35240617-541a-4124-b68e-fffa3ff62b95',
                email: 'test@email.com',
                role: UserRole.USER
            } as User;

            mockTokenService.generateTokens.mockReturnValue({
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
                accessTokenExpiresIn: '7d',
            });

            // Act
            const result = await service.login(mockUser);

            // Assert
            expect(result).toEqual({
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
                role: UserRole.USER,
            });

            expect(mockTokenService.generateTokens).toHaveBeenCalledWith({
                sub: '35240617-541a-4124-b68e-fffa3ff62b95',
                email: 'test@email.com',
                role: UserRole.USER,
            });

            expect(mockTokenService.revokeToken).toHaveBeenCalledWith(
                '35240617-541a-4124-b68e-fffa3ff62b95',
            );

            expect(mockTokenService.saveToken).toHaveBeenCalledWith(
                '35240617-541a-4124-b68e-fffa3ff62b95',
                'access-token',
                '7d'
            );
        });
    });
});