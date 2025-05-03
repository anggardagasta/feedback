import {Field, InputType} from '@nestjs/graphql';
import {IsEnum, IsOptional} from 'class-validator';
import {NotificationStatus, NotificationType} from '../schemas/notification.schema';

@InputType()
export class NotificationFilterInput {
    @Field(() => NotificationType, {nullable: true})
    @IsEnum(NotificationType)
    @IsOptional()
    type?: NotificationType;

    @Field(() => NotificationStatus, {nullable: true})
    @IsEnum(NotificationStatus)
    @IsOptional()
    status?: NotificationStatus;
}