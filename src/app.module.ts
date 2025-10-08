import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
        UsersModule,
        MongooseModule.forRoot(process.env.MONGO_URI ?? (() => { throw new Error("MONGO_URI is not set in the .env\nHave you used the command: `npm run setup`?\n"); })()),
        CaslModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
