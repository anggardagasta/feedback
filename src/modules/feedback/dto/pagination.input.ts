import {Field, InputType, Int, registerEnumType} from '@nestjs/graphql';
import {IsEnum, IsInt, IsOptional, Max, Min} from 'class-validator';

export enum SortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export enum FeedbackSortField {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    CATEGORY = 'category',
    STATUS = 'status',
}

registerEnumType(SortDirection, {
    name: 'SortDirection',
});

registerEnumType(FeedbackSortField, {
    name: 'FeedbackSortField',
});

@InputType()
export class PaginationInput {
    @Field(() => Int, {defaultValue: 1})
    @IsInt()
    @Min(1)
    @IsOptional()
    page: number = 1;

    @Field(() => Int, {defaultValue: 10})
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit: number = 10;

    @Field(() => FeedbackSortField, {defaultValue: FeedbackSortField.CREATED_AT})
    @IsEnum(FeedbackSortField)
    @IsOptional()
    sortBy: FeedbackSortField = FeedbackSortField.CREATED_AT;

    @Field(() => SortDirection, {defaultValue: SortDirection.DESC})
    @IsEnum(SortDirection)
    @IsOptional()
    sortDirection: SortDirection = SortDirection.DESC;
}