import {Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {Between, FindOptionsWhere, IsNull, Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {Feedback} from './entities/feedback.entity';
import {CreateFeedbackInput} from './dto/create-feedback.input';
import {UpdateFeedbackInput} from './dto/update-feedback.input';
import {FeedbackAttachmentService} from './feedback-attachment.service';
import {FeedbackFilterInput} from './dto/feedback-filter.input';
import {PaginationInput} from './dto/pagination.input';
import {PaginatedFeedbackResponse} from './dto/paginated-feedback.response';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Feedback)
        private feedbackRepository: Repository<Feedback>,
        private feedbackAttachmentService: FeedbackAttachmentService,
    ) {
    }

    async create(createFeedbackData: CreateFeedbackInput & {
        userId: string,
        attachmentUrl?: string,
        attachmentMetadata?: any
    }): Promise<Feedback> {
        const feedback = this.feedbackRepository.create({
            userId: createFeedbackData.userId,
            content: createFeedbackData.content,
            category: createFeedbackData.category,
        });

        const savedFeedback = await this.feedbackRepository.save(feedback);

        // If there's an attachment, store it to MongoDB
        if (createFeedbackData.attachmentUrl && createFeedbackData.attachmentMetadata) {
            await this.feedbackAttachmentService.create({
                feedbackId: savedFeedback.id,
                url: createFeedbackData.attachmentUrl,
                originalFilename: createFeedbackData.attachmentMetadata.filename,
                mimeType: createFeedbackData.attachmentMetadata.mimetype,
            });
        }

        return savedFeedback;
    }

    async update(updateFeedbackInput: UpdateFeedbackInput, userId: string): Promise<Feedback> {
        const feedback = await this.feedbackRepository.findOne({
            where: {
                id: updateFeedbackInput.id,
                deletedAt: IsNull()
            }
        });

        if (!feedback) {
            throw new NotFoundException(`Feedback not found`);
        }

        if (updateFeedbackInput.status) {
            feedback.status = updateFeedbackInput.status;
        }

        return this.feedbackRepository.save(feedback);
    }

    async findAll(
        filter: FeedbackFilterInput,
        pagination: PaginationInput
    ): Promise<PaginatedFeedbackResponse> {
        const where: FindOptionsWhere<Feedback> = {
            deletedAt: IsNull()
        };

        // Apply filters
        if (filter?.category) {
            where.category = filter.category;
        }

        if (filter?.status) {
            where.status = filter.status;
        }

        // Date range filter
        if (filter?.startDate && filter?.endDate) {
            where.createdAt = Between(filter.startDate, filter.endDate);
        } else if (filter?.startDate) {
            where.createdAt = Between(filter.startDate, new Date());
        }

        // Calculate pagination
        const skip = (pagination.page - 1) * pagination.limit;

        // Create sort object
        const order = {
            [pagination.sortBy]: pagination.sortDirection,
        };

        // Execute query with count
        const [items, total] = await this.feedbackRepository.findAndCount({
            where,
            order,
            skip,
            take: pagination.limit,
        });

        // Calculate total pages
        const pages = Math.ceil(total / pagination.limit);

        return {
            items,
            total,
            page: pagination.page,
            limit: pagination.limit,
            pages,
        };
    }

    async findOne(id: string): Promise<any> {
        const feedback = await this.feedbackRepository.findOne({
            where: {
                id,
                deletedAt: IsNull()
            }
        });

        if (!feedback) {
            throw new NotFoundException(`Feedback not found`);
        }

        const attachments = await this.feedbackAttachmentService.findByFeedbackId(id);
        if (attachments) {
            return {
                ...feedback,
                attachments,
            };
        }

        return feedback;
    }
}