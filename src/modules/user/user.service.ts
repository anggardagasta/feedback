import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {IsNull, Repository} from 'typeorm';
import {User} from './entities/user.entity';
import {UserStatus} from "./enums/user-status.enum";
import {UserRole} from "./enums/user-role.enum";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
    }

    async getActiveUsers(): Promise<User[]> {
        return this.userRepository.find({
            where: {
                status: UserStatus.ACTIVE,
                role: UserRole.USER,
                deletedAt: IsNull(),
            },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: {
                email,
                deletedAt: IsNull()
            }
        });
    }
}
