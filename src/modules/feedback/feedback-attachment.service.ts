import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {FeedbackAttachment} from './schemas/feedback-attachment.schema';

@Injectable()
export class FeedbackAttachmentService {
    constructor(
        @InjectModel(FeedbackAttachment.name)
        private feedbackAttachmentModel: Model<FeedbackAttachment>,
    ) {
    }

    async create(data: {
        feedbackId: string;
        url: string;
        originalFilename: string;
        mimeType: string;
    }): Promise<FeedbackAttachment> {
        const attachment = new this.feedbackAttachmentModel(data);
        return attachment.save();
    }

    async findByFeedbackId(feedbackId: string): Promise<FeedbackAttachment[]> {
        return this.feedbackAttachmentModel.find({feedbackId}).exec();
    }
}