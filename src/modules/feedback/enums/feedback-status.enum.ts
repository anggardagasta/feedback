import {registerEnumType} from '@nestjs/graphql';

export enum FeedbackStatus {
    PENDING = 'PENDING',
    REVIEWED = 'REVIEWED',
    RESOLVED = 'RESOLVED',
}

registerEnumType(FeedbackStatus, {
    name: 'FeedbackStatus',
    description: 'The status a feedback can have',
});