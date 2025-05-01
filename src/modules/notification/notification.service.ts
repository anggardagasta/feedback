import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationStatus, NotificationType } from './schemas/notification.schema';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async createFeedbackReminder(userId: string): Promise<Notification> {
    this.logger.log(`Creating feedback reminder notification for user ${userId}`);
    
    const notification = new this.notificationModel({
      userId,
      type: NotificationType.FEEDBACK_REMINDER,
      title: 'Feedback Reminder',
      message: 'We noticed you have not submitted any feedback recently. Your feedback is important to us and helps us improve our services.',
      status: NotificationStatus.UNREAD,
    });
    
    return notification.save();
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }
}