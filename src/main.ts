import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(process.env.PORT ?? (() => { throw new Error("PORT is not set in the .env\nHave you used the command: `npm run setup`?\n"); })());
    console.log(`Server running on http://127.0.0.1:${process.env.PORT ?? 6969}`)
}
bootstrap();
