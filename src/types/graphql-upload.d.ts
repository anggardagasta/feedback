declare module 'graphql-upload' {
    import {RequestHandler} from 'express';
    import {GraphQLScalarType} from 'graphql';

    export const graphqlUploadExpress: (options?: {
        maxFieldSize?: number;
        maxFileSize?: number;
        maxFiles?: number;
    }) => RequestHandler;

    export const GraphQLUpload: GraphQLScalarType;
}