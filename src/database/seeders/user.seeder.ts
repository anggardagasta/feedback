import {DataSource} from 'typeorm';
import {User} from '../../modules/user/entities/user.entity';
import * as bcrypt from 'bcrypt';

export const seedUsers = async (dataSource: DataSource) => {
    const userRepo = dataSource.getRepository(User);

    const users = [
        {
            name: 'User',
            email: 'user@email.com',
            password: await bcrypt.hash('user', 10),
            role: 'USER',
            status: 'ACTIVE',
        },
        {
            name: 'Admin',
            email: 'admin@email.com',
            password: await bcrypt.hash('admin', 10),
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    ];

    for (const userData of users) {
        const existing = await userRepo.findOneBy({email: userData.email});
        if (!existing) {
            const user = userRepo.create(userData);
            await userRepo.save(user);
            console.log(`Seeded: ${userData.email}`);
        } else {
            console.log(`Skipped (exists): ${userData.email}`);
        }
    }
};
