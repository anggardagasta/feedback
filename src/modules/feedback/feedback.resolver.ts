import {Args, Context, Mutation, Query, Resolver} from '@nestjs/graphql';
import {FeedbackService} from './feedback.service';
import {Feedback} from './entities/feedback.entity';
import {CreateFeedbackInput} from './dto/create-feedback.input';
import {UpdateFeedbackInput} from './dto/update-feedback.input';
import {UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';
import {UploadResolver} from '../upload/upload.resolver';
import {RolesGuard} from '../auth/guards/roles.guard';
import {Roles} from '../auth/decorators/roles.decorator';
import {UserRole} from '../user/enums/user-role.enum';
import {FeedbackFilterInput} from './dto/feedback-filter.input';
import {PaginationInput} from './dto/pagination.input';
import {PaginatedFeedbackResponse} from './dto/paginated-feedback.response';

@Resolver(() => Feedback)
export class FeedbackResolver {
    constructor(
        private readonly feedbackService: FeedbackService,
        private readonly uploadResolver: UploadResolver,
    ) {
    }

    @Mutation(() => Feedback)
    @UseGuards(JwtAuthGuard)
    async createFeedback(
        @Args('input') createFeedbackInput: CreateFeedbackInput,
        @Context() context: any,
    ): Promise<Feedback> {
        const userId = context.req.user.id;

        let attachmentUrl = '';
        let attachmentMetadata = null;

        if (createFeedbackInput.attachment) {
            const file = await createFeedbackInput.attachment;
            const directory = createFeedbackInput.directory || 'feedback';

            attachmentUrl = await this.uploadResolver.uploadFile(file, directory);

            attachmentMetadata = {
                filename: file.filename,
                mimetype: file.mimetype,
            };
        }

        return this.feedbackService.create({
            ...createFeedbackInput,
            userId,
            attachmentUrl,
            attachmentMetadata,
        });
    }

    @Mutation(() => Feedback)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async updateFeedback(
        @Args('input') updateFeedbackInput: UpdateFeedbackInput,
        @Context() context: any,
    ): Promise<Feedback> {
        const userId = context.req.user.id;
        return this.feedbackService.update(updateFeedbackInput, userId);
    }

    @Query(() => PaginatedFeedbackResponse)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async getAllFeedback(
        @Args('filter', {nullable: true}) filter: FeedbackFilterInput = {},
        @Args('pagination', {nullable: true}) pagination: PaginationInput = new PaginationInput(),
    ): Promise<PaginatedFeedbackResponse> {
        return this.feedbackService.findAll(filter, pagination);
    }

    @Query(() => Feedback)
    @UseGuards(JwtAuthGuard)
    async getFeedback(
        @Args('id') id: string,
    ): Promise<any> {
        return this.feedbackService.findOne(id);
    }
}