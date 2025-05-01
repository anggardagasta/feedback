import {registerEnumType} from '@nestjs/graphql';

export enum FeedbackCategory {
    BUG = 'BUG',
    FEATURE = 'FEATURE',
    GENERAL = 'GENERAL',
}

registerEnumType(FeedbackCategory, {
    name: 'FeedbackCategory',
    description: 'The category a feedback can have',
});