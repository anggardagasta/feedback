import {Field, InputType} from '@nestjs/graphql';
import {IsDate, IsEnum, IsOptional, IsString} from 'class-validator';
import {FeedbackCategory} from '../enums/feedback-category.enum';
import {FeedbackStatus} from '../enums/feedback-status.enum';

@InputType()
export class FeedbackFilterInput {
    @Field(() => FeedbackCategory, {nullable: true})
    @IsEnum(FeedbackCategory)
    @IsOptional()
    category?: FeedbackCategory;

    @Field(() => FeedbackStatus, {nullable: true})
    @IsEnum(FeedbackStatus)
    @IsOptional()
    status?: FeedbackStatus;

    @Field({nullable: true})
    @IsDate()
    @IsOptional()
    startDate?: Date;

    @Field({nullable: true})
    @IsDate()
    @IsOptional()
    endDate?: Date;
}