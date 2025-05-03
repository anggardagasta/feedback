import {Field, InputType} from '@nestjs/graphql';
import {IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID} from 'class-validator';
import {FeedbackCategory} from '../enums/feedback-category.enum';
import {GraphQLUpload} from 'graphql-upload';
import {FileUpload} from '../../../types/upload-types';

@InputType()
export class CreateFeedbackInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    content!: string;

    @Field(() => FeedbackCategory)
    @IsEnum(FeedbackCategory)
    category!: FeedbackCategory;

    @Field(() => GraphQLUpload, {nullable: true})
    @IsOptional()
    attachment?: Promise<FileUpload>;

    @Field({nullable: true})
    @IsString()
    @IsOptional()
    directory?: string;
}