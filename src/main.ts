import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
            transform: true,
        }),
    );

    console.log(join(__dirname, '/uploads'))
    app.useStaticAssets(join(__dirname, '/uploads'), {
        prefix: '/uploads/',
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Application is running on: ${process.env.HOST}:${port}`);
}
bootstrap();
