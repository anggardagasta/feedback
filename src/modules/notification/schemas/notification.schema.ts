import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {Field, ObjectType, registerEnumType} from '@nestjs/graphql';

export enum NotificationType {
    FEEDBACK_REMINDER = 'FEEDBACK_REMINDER',
    FEEDBACK_STATUS_CHANGE = 'FEEDBACK_STATUS_CHANGE'
}

registerEnumType(NotificationType, {
    name: 'NotificationType',
    description: 'The type of notification',
});

export enum NotificationStatus {
    UNREAD = 'UNREAD',
    READ = 'READ'
}

registerEnumType(NotificationStatus, {
    name: 'NotificationStatus',
    description: 'The status of notification',
});

@ObjectType()
@Schema({timestamps: true})
export class Notification extends Document {
    @Field()
    @Prop({required: true, index: true})
    userId!: string;

    @Field(() => NotificationType)
    @Prop({required: true, enum: NotificationType})
    type!: NotificationType;

    @Field()
    @Prop({required: true})
    title!: string;

    @Field()
    @Prop({required: true})
    message!: string;

    @Field(() => NotificationStatus)
    @Prop({required: true, enum: NotificationStatus, default: NotificationStatus.UNREAD})
    status!: NotificationStatus;

    @Field()
    @Prop({type: Date, default: Date.now})
    createdAt!: Date;

    @Field()
    @Prop({type: Date, default: Date.now})
    updatedAt!: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);