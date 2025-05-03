import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Notification, NotificationSchema} from './schemas/notification.schema';
import {NotificationService} from './notification.service';
import {NotificationResolver} from './notification.resolver';

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Notification.name, schema: NotificationSchema},
        ]),
        TypeOrmModule.forFeature([]),
    ],
    providers: [NotificationService, NotificationResolver],
    exports: [NotificationService],
})
export class NotificationModule {
}