import * as dotenv from 'dotenv';

dotenv.config();

export const jwtConstants = {
    secret: process.env.JWT_SECRET ?? (() => { throw new Error("JWT_SECRET is not set in the .env\nHave you used the command: `npm run setup`?\n"); })(),
};
