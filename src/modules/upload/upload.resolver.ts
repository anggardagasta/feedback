import {Resolver, Mutation, Args} from '@nestjs/graphql';
import {GraphQLUpload} from 'graphql-upload';
import * as path from 'path';
import {createWriteStream, existsSync, mkdirSync} from 'fs';
import {Observable, firstValueFrom} from 'rxjs';
import {v4 as uuidv4} from 'uuid';

import {FileUpload} from '../../types/upload-types';

@Resolver()
export class UploadResolver {
    // @todo move it to env or database
    private readonly allowedDirectories = ['feedback', 'avatars', 'products'];

    @Mutation(() => String)
    async uploadFile(
        @Args({name: 'file', type: () => GraphQLUpload}) file: FileUpload,
        @Args({name: 'directory', type: () => String, nullable: true, defaultValue: 'feedback'}) directory: string
    ): Promise<string> {
        // Validate directory
        this.validateDirectory(directory);

        // Validate file type
        this.validateFileType(file);

        const {createReadStream, filename} = file;

        // Get file extension from original filename
        const fileExtension = path.extname(filename);

        // Generate a UUID for the new filename
        const newFilename = `${uuidv4()}${fileExtension}`;

        // Create uploads directory path with feedback subfolder
        const uploadsDir = path.join(__dirname, `../../uploads/${directory}`);

        // Check if directory exists, if not create it
        if (!existsSync(uploadsDir)) {
            mkdirSync(uploadsDir, {recursive: true});
        }

        const filePath = path.join(uploadsDir, newFilename);
        const writeStream = createWriteStream(filePath);

        const readStream = createReadStream();

        // Return the observable and await its result
        await firstValueFrom(new Observable((observer) => {
            readStream.pipe(writeStream);

            writeStream.on('finish', () => {
                observer.next(`File uploaded successfully: ${newFilename}`);
                observer.complete();
            });

            writeStream.on('error', (error) => {
                observer.error(error);
            });
        }));

        return `${process.env.HOST}:${process.env.PORT}/uploads/${directory}/${newFilename}`;
    }

    private validateDirectory(directory: string): void {
        // Sanitize directory name to prevent directory traversal
        const sanitizedDirectory = directory.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();

        // Check if sanitized directory is in the allowed list
        if (!this.allowedDirectories.includes(sanitizedDirectory)) {
            throw new Error(`Directory '${directory}' is not allowed. Allowed directories are: ${this.allowedDirectories.join(', ')}`);
        }
    }

    /**
     * Validates that the file is an allowed image type
     */
    private validateFileType(file: FileUpload): void {
        const {mimetype, filename} = file;

        // Define allowed image MIME types
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
        ];

        // Check if the file's MIME type is in the allowed list
        if (!allowedMimeTypes.includes(mimetype)) {
            throw new Error(`File type '${mimetype}' is not allowed. Allowed types are: ${allowedMimeTypes.join(', ')}`);
        }

        // Additional validation: check file extension
        const fileExtension = path.extname(filename).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];

        if (!allowedExtensions.includes(fileExtension)) {
            throw new Error(`File extension '${fileExtension}' is not allowed. Allowed extensions are: ${allowedExtensions.join(', ')}`);
        }
    }
}
