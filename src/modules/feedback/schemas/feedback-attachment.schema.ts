import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {Field, ObjectType} from '@nestjs/graphql';

@ObjectType()
@Schema({timestamps: true})
export class FeedbackAttachment extends Document {
    @Field()
    @Prop({required: true, index: true})
    feedbackId!: string;

    @Field()
    @Prop()
    url!: string;

    @Field()
    @Prop()
    originalFilename!: string;

    @Field()
    @Prop()
    mimeType!: string;
}

export const FeedbackAttachmentSchema = SchemaFactory.createForClass(FeedbackAttachment);