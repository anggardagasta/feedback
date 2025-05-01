import {Module, MiddlewareConsumer, RequestMethod} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {GraphQLModule} from '@nestjs/graphql';
import {ApolloDriver, ApolloDriverConfig} from '@nestjs/apollo';
import {MongooseModule} from '@nestjs/mongoose';
import {join} from 'path';
import {TypeOrmModule} from '@nestjs/typeorm';
import {graphqlUploadExpress} from 'graphql-upload';

import {AppResolver} from './modules/app/app.resolver';

import {AppDataSource} from './database/data-source';
import mongoConfig from './database/mongo.config';

import {AuthModule} from './modules/auth/auth.module';
import {UploadModule} from './modules/upload/upload.module';
import {FeedbackModule} from './modules/feedback/feedback.module';
import {NotificationModule} from './modules/notification/notification.module';
import {ReminderModule} from './modules/reminder/reminder.module';

@Module({
    imports: [
        // Load environment variables
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        // GraphQL configuration
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
            playground: true,
            path: 'query',
            debug: true,
            csrfPrevention: process.env.NODE_ENV === "production", // enable/disable CSRF protection
        }),

        TypeOrmModule.forRoot(AppDataSource.options),

        MongooseModule.forRoot(mongoConfig.uri),

        // feature modules
        AuthModule,
        UploadModule,
        FeedbackModule,
        NotificationModule,
        ReminderModule,
    ],
    providers: [
        AppResolver,
    ],
})

export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(graphqlUploadExpress({
                maxFileSize: 5000000, // 5MB
                maxFiles: 1
            }))
            .forRoutes('query');
    }
}
