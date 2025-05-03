import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MongooseModule} from '@nestjs/mongoose';
import {Feedback} from './entities/feedback.entity';
import {FeedbackService} from './feedback.service';
import {FeedbackResolver} from './feedback.resolver';
import {UploadModule} from '../upload/upload.module';
import {FeedbackAttachment, FeedbackAttachmentSchema} from './schemas/feedback-attachment.schema';
import {FeedbackAttachmentService} from './feedback-attachment.service';
import {NotificationModule} from "../notification/notification.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Feedback]),
        MongooseModule.forFeature([
            {name: FeedbackAttachment.name, schema: FeedbackAttachmentSchema},
        ]),
        UploadModule,
        NotificationModule,
    ],
    providers: [FeedbackService, FeedbackResolver, FeedbackAttachmentService],
    exports: [FeedbackService],
})
export class FeedbackModule {
}