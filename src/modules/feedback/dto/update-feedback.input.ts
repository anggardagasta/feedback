import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { FeedbackStatus } from '../enums/feedback-status.enum';

@InputType()
export class UpdateFeedbackInput {
    @Field(() => ID)
    @IsUUID()
    @IsNotEmpty()
    id!: string;

    @Field(() => FeedbackStatus, { nullable: true })
    @IsEnum(FeedbackStatus)
    @IsOptional()
    status?: FeedbackStatus;
}