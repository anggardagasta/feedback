import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ScheduleModule} from '@nestjs/schedule';
import {ReminderService} from './reminder.service';
import {User} from '../user/entities/user.entity';
import {Feedback} from '../feedback/entities/feedback.entity';
import {NotificationModule} from '../notification/notification.module';
import {UserModule} from "../user/user.module";
import {FeedbackModule} from "../feedback/feedback.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Feedback]),
        ScheduleModule.forRoot(),
        NotificationModule,
        UserModule,
        FeedbackModule,
    ],
    providers: [ReminderService],
    exports: [ReminderService],
})
export class ReminderModule {
}