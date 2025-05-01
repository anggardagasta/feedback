declare module 'graphql-upload' {
    import {RequestHandler} from 'express';
    import {GraphQLScalarType} from 'graphql';
    import {Readable} from 'stream';

    // export interface FileUpload {
    //     filename: string;
    //     mimetype: string;
    //     encoding: string;
    //     createReadStream: () => Readable;
    // }

    export const graphqlUploadExpress: (options?: {
        maxFieldSize?: number;
        maxFileSize?: number;
        maxFiles?: number;
    }) => RequestHandler;

    export const GraphQLUpload: GraphQLScalarType;
}