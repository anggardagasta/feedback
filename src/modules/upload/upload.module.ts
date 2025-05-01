import {Module} from '@nestjs/common';
import {UploadResolver} from './upload.resolver';

@Module({
    providers: [UploadResolver],
    exports: [UploadResolver],
})
export class UploadModule {
}