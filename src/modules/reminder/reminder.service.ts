import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, IsNull, MoreThanOrEqual} from 'typeorm';
import {SchedulerRegistry} from '@nestjs/schedule';
import {ConfigService} from '@nestjs/config';
import {User} from '../user/entities/user.entity';
import {Feedback} from '../feedback/entities/feedback.entity';
import {NotificationService} from '../notification/notification.service';
import {UserStatus} from '../user/enums/user-status.enum';
import {UserRole} from "../user/enums/user-role.enum";
import {CronJob} from 'cron';
import {UserService} from "../user/user.service";
import {FeedbackService} from "../feedback/feedback.service";

@Injectable()
export class ReminderService implements OnModuleInit {
    private readonly logger = new Logger(ReminderService.name);

    constructor(
        private readonly userService: UserService,
        private readonly feedbackService: FeedbackService,
        private readonly notificationService: NotificationService,
        private readonly configService: ConfigService,
        private schedulerRegistry: SchedulerRegistry,
    ) {
    }

    onModuleInit() {
        const cronExpression = this.configService.get<string>('FEEDBACK_REMINDER_CRON', '*/5 * * * *');

        // Create a new cron job with the expression from config
        const job = new CronJob(cronExpression, () => {
            this.createFeedbackReminders();
        });

        // Add the job to the registry
        this.schedulerRegistry.addCronJob('feedbackReminders', job);

        // Start the job
        job.start();

        this.logger.log(`Feedback reminder job scheduled with cron: ${cronExpression}`);
    }

    async createFeedbackReminders() {
        try {
            this.logger.log('Start feedback reminder job');

            const reminderDays = this.configService.get<number>('FEEDBACK_REMINDER_DAYS', 7);

            // Calculate the date threshold
            const thresholdDate = new Date();
            thresholdDate.setDate(thresholdDate.getDate() - reminderDays);

            // Find users who need reminders
            const usersNeedingReminders = await this.findUsersWithoutRecentFeedback(thresholdDate);

            this.logger.log(`Found ${usersNeedingReminders.length} users who need feedback reminders`);

            for (const user of usersNeedingReminders) {
                try {
                    await this.notificationService.createFeedbackReminder(user.id);
                    this.logger.log(`Created reminder notification for user: ${user.email}`);
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        this.logger.error(`Failed to create reminder for user ${user.email}`, error.stack);
                    } else {
                        this.logger.error(`Failed to create reminder for user ${user.email}`, String(error));
                    }
                }
            }

            this.logger.log('Completed feedback reminder job');
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.logger.error('Error in feedback reminder job', error.stack);
            } else {
                this.logger.error('Error in feedback reminder job', String(error));
            }
        }
    }

    private async findUsersWithoutRecentFeedback(thresholdDate: Date): Promise<User[]> {
        const activeUsers = await this.userService.getActiveUsers();

        const usersNeedingReminders: User[] = [];

        for (const user of activeUsers) {
            const feedback = await this.feedbackService.findUserRecentFeedback(user.id, thresholdDate);

            if (!feedback) {
                usersNeedingReminders.push(user);
            }
        }

        return usersNeedingReminders;
    }
}