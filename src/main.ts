import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: [
            'http://localhost:5173',
            'https://oldmartijntje.github.io',
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });

    const port = process.env.PORT ?? (() => {
        throw new Error("PORT is not set in the .env\nHave you used the command: `npm run setup`?\n");
    })();
    await app.listen(port, '0.0.0.0');

    console.log(`Server running on http://0.0.0.0:${port}`);
}
bootstrap();