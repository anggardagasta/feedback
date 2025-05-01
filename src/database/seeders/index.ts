import {seedUsers} from './user.seeder';
import {AppDataSource} from '../data-source';

AppDataSource.initialize()
    .then(async () => {
        console.log('Running seeders...');
        await seedUsers(AppDataSource);
        console.log('Seeding done.');
        await AppDataSource.destroy();
    })
    .catch((error) => {
        console.error('Seeding error:', error);
        process.exit(1);
    });

