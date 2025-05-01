import {Field, Int, ObjectType} from '@nestjs/graphql';
import {Feedback} from '../entities/feedback.entity';

@ObjectType()
export class PaginatedFeedbackResponse {
    @Field(() => [Feedback])
    items?: Feedback[];

    @Field(() => Int)
    total!: number;

    @Field(() => Int)
    page!: number;

    @Field(() => Int)
    limit!: number;

    @Field(() => Int)
    pages!: number;
}