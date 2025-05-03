import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Notification, NotificationStatus, NotificationType} from './schemas/notification.schema';
import {NOTIFICATION_MESSAGES} from "./constants/notification-messages.constants";

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        @InjectModel(Notification.name)
        private notificationModel: Model<Notification>,
    ) {
    }

    async createFeedbackReminder(userId: string): Promise<Notification> {
        this.logger.log(`Creating feedback reminder notification for user ${userId}`);

        const payload = {
            userId,
            type: NotificationType.FEEDBACK_REMINDER,
            title: NOTIFICATION_MESSAGES.FEEDBACK_REMINDER.TITLE,
            message: NOTIFICATION_MESSAGES.FEEDBACK_REMINDER.MESSAGE,
            status: NotificationStatus.UNREAD,
        }

        return this.save(payload);
    }

    async createFeedbackStatusChange(userId: string, status: string): Promise<Notification> {
        this.logger.log(`Creating feedback status change notification for user ${userId}`);

        const payload = {
            userId,
            type: NotificationType.FEEDBACK_STATUS_CHANGE,
            title: NOTIFICATION_MESSAGES.FEEDBACK_STATUS_CHANGE.TITLE,
            message: NOTIFICATION_MESSAGES.FEEDBACK_STATUS_CHANGE.MESSAGE.replace('{status}', status),
            status: NotificationStatus.UNREAD,
        };

        return this.save(payload);
    }

    async findByUserId(userId: string): Promise<Notification[]> {
        return this.notificationModel.find({userId}).sort({createdAt: -1}).exec();
    }

    async save(payload: {
        userId: string,
        type: NotificationType;
        title: string;
        message: string,
        status: NotificationStatus
    }): Promise<Notification> {
        const notification = new this.notificationModel(payload);

        return notification.save();
    }
}