import {Column, Entity, Index, PrimaryGeneratedColumn} from 'typeorm';
import {Field, ObjectType, ID, registerEnumType} from '@nestjs/graphql';
import {FeedbackCategory} from '../enums/feedback-category.enum';
import {FeedbackStatus} from '../enums/feedback-status.enum';
import {FeedbackAttachment} from '../schemas/feedback-attachment.schema';

registerEnumType(FeedbackCategory, {
    name: 'FeedbackCategory',
})

registerEnumType(FeedbackStatus, {
    name: 'FeedbackStatus',
})

@ObjectType()
@Entity()
export class Feedback {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Field()
    @Index()
    @Column('uuid')
    userId!: string;

    @Field()
    @Column('text')
    content!: string;

    @Field()
    @Column({type: 'enum', enum: FeedbackCategory, default: FeedbackCategory.GENERAL})
    category!: string;

    @Field()
    @Column({type: 'enum', enum: FeedbackStatus, default: FeedbackStatus.PENDING})
    status!: string;

    @Field(() => [FeedbackAttachment], {nullable: true})
    attachments?: FeedbackAttachment[];

    @Field()
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    createdAt!: Date;

    @Field()
    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    updatedAt!: Date;

    @Field()
    @Column({type: 'timestamptz', nullable: true})
    deletedAt!: Date;
}
