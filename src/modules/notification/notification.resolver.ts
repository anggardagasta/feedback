import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './schemas/notification.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationFilterInput } from './dto/notification-filter.input';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Query(() => [Notification])
  @UseGuards(JwtAuthGuard)
  async getNotifications(
    @Context() context: any,
    @Args('filter', { nullable: true }) filter?: NotificationFilterInput,
  ): Promise<Notification[]> {
    const userId = context.req.user.id;
    const notifications = await this.notificationService.findByUserId(userId);
    
    // Apply filters if provided
    if (filter) {
      return notifications.filter(notification => {
        if (filter.type && notification.type !== filter.type) return false;
        return !(filter.status && notification.status !== filter.status);
      });
    }
    
    return notifications;
  }
}