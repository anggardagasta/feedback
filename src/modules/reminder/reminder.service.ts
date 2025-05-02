import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {SchedulerRegistry} from '@nestjs/schedule';
import {ConfigService} from '@nestjs/config';
import {User} from '../user/entities/user.entity';
import {NotificationService} from '../notification/notification.service';
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
        this.setupReminderCronJob();
    }

    async createFeedbackReminders() {
        try {
            this.logger.log('Start feedback reminder job');

            // Threshold date
            const thresholdDate = this.calculateThresholdDate();

            // Find users who need reminders
            const usersNeedingReminders = await this.findUsersWithoutRecentFeedback(thresholdDate);

            this.logger.log(`Found ${usersNeedingReminders.length} users who need feedback reminders`);

            await this.sendReminders(usersNeedingReminders);

            this.logger.log('Completed feedback reminder job');
        } catch (error: unknown) {
            this.handleError('Error in feedback reminder job', error);
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

    private setupReminderCronJob() {
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

    private calculateThresholdDate(): Date {
        const reminderDays = this.configService.get<number>('FEEDBACK_REMINDER_DAYS', 7);
        const thresholdDate = new Date();

        thresholdDate.setDate(thresholdDate.getDate() - reminderDays);

        return thresholdDate;
    }

    private async sendReminders(users: User[]): Promise<void> {
        for (const user of users) {
            try {
                await this.notificationService.createFeedbackReminder(user.id);
                this.logger.log(`Created reminder notification for user: ${user.email}`);
            } catch (error: unknown) {
                this.handleError(`Failed to create reminder for user ${user.email}`, error);
            }
        }
    }

    private handleError(message: string, error: unknown): void {
        if (error instanceof Error) {
            this.logger.error(message, error.stack);
        } else {
            this.logger.error(message, String(error));
        }
    }
}