

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import bcrypt from 'bcrypt';
const projectName = "lu1poc"

const DEFAULT_URI = `mongodb://localhost:27017/${projectName}`;

function randomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function promptDatabase() {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'uriChoice',
            message: 'Select Mongo connection string:',
            choices: [
                { name: `Use default (${DEFAULT_URI})`, value: 'default' },
                { name: 'Enter custom URI…', value: 'custom' }
            ]
        },
        {
            type: 'input',
            name: 'mongoUri',
            message: 'Enter Mongo URI:',
            when: answers => answers.uriChoice === 'custom',
            default: DEFAULT_URI
        }
    ]);
    return answers.uriChoice === 'default' ? DEFAULT_URI : answers.mongoUri;
}

async function promptPort() {
    const { portChoice } = await inquirer.prompt([{
        type: 'list',
        name: 'portChoice',
        message: 'Select port for web application:',
        choices: ['6969', '4200', '3000', '4242', 'custom'],
    }]);
    if (portChoice === 'custom') {
        const { customPort } = await inquirer.prompt([{
            type: 'input',
            name: 'customPort',
            message: 'Enter custom port:',
            default: '4242',
            validate: input => {
                const num = parseInt(input, 10);
                return !isNaN(num) && num > 0 ? true : 'Please enter a valid port number';
            }
        }]);
        return customPort;
    }
    return portChoice;
}

async function promptjwtExpirationMinutes() {
    const { timeChoice } = await inquirer.prompt([{
        type: 'list',
        name: 'timeChoice',
        message: 'Select JWT expiration time:',
        choices: [
            { name: '1 minute', value: 1 },
            { name: '1 hour', value: 60 },
            { name: '1 day', value: 1440 },
            { name: '1 week', value: 10080 },
            { name: 'Custom (in minutes)', value: 'custom' },
        ],
        default: 1440 // 1 day
    }]);

    if (timeChoice === 'custom') {
        const { customTime } = await inquirer.prompt([{
            type: 'input',
            name: 'customTime',
            message: 'Enter custom expiration time (in minutes):',
            default: 1440, // 1 day in minutes
            validate: input => {
                const num = parseInt(input, 10);
                return !isNaN(num) && num > 0 ? true : 'Please enter a valid number of minutes';
            }
        }]);
        return parseInt(customTime, 10);
    }

    return timeChoice; // Already an int
}

async function promptJwtSecret() {
    const { jwtChoice } = await inquirer.prompt([{
        type: 'list',
        name: 'jwtChoice',
        message: 'The JWT secret',
        choices: ['random 128 char string', 'random 256 char string', 'random 64 char string', 'random 32 char string', 'custom']
    }]);
    if (jwtChoice === 'custom') {
        const { customJwt } = await inquirer.prompt([{
            type: 'input',
            name: 'customJwt',
            message: 'Enter custom JWT secret:',
            default: 'CREATE A COMPLEX SECRET'
        }]);
        return { manual: customJwt };
    } else {
        switch (jwtChoice) {
            case 'random 128 char string':
                return { gen: 128 };
            case 'random 64 char string':
                return { gen: 64 };
            case 'random 32 char string':
                return { gen: 32 };
            case 'random 256 char string':
                return { gen: 256 };
        }
    }
}

async function promptAdminAccount() {
    const { createAdmin } = await inquirer.prompt([{
        type: 'confirm',
        name: 'createAdmin',
        message: 'Create a default admin account?',
        default: true,
    }]);
    if (!createAdmin) return null;
    const admin = await inquirer.prompt([
        {
            type: 'input',
            name: 'username',
            message: 'Admin username:',
            default: 'admin',
        },
        {
            type: 'password',
            name: 'password',
            message: 'Admin password:',
            mask: '*',
            validate: input => input.length >= 6 ? true : 'Password must be at least 6 characters',
        }
    ]);
    admin.hashedPassword = await bcrypt.hash(admin.password, 10);
    delete admin.password;
    return admin;
}


// Email config removed

async function main() {
    try {
        // Ask for advanced setup
        const { advanced } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'advanced',
                message: 'Run advanced setup?',
                default: false
            }
        ]);

        // Pass advanced mode to promptAccountCreation
        global.__ADVANCED_SETUP__ = advanced;

        const finalUri = await promptDatabase();
        console.log('→ Final URI:', finalUri);
        const finalPort = await promptPort();
        const adminAccount = await promptAdminAccount();

        // Insert admin into DB if requested
        if (adminAccount) {
            // Dynamically import mongoose and define schema inline
            const mongoose = (await import('mongoose')).default;
            const userJsonSchema = {
                username: { type: String, required: true },
                password: { type: String, required: true },
                email: { type: String, required: false },
                role: { type: String, required: true }
            };
            const userSchema = new mongoose.Schema(userJsonSchema);
            const User = mongoose.model('user', userSchema);
            await mongoose.connect(finalUri);
            const role = 'ADMIN';
            const exists = await User.findOne({ username: adminAccount.username });
            if (exists) {
                console.log(`Admin user '${adminAccount.username}' already exists in database.`);
            } else {
                await User.create({
                    username: adminAccount.username,
                    password: adminAccount.hashedPassword,
                    email: `${adminAccount.username}@template.mail`,
                    role: role
                });
                console.log(`Admin user '${adminAccount.username}' created in database.`);
            }
            await mongoose.disconnect();
        }

        // settings.json
        let generateJwtSecretLength = 128;
        let jwtSecret;
        let jwtExpirationMinutes = 1440;

        if (advanced) {
            const jwtSecretResponse = await promptJwtSecret();
            if (jwtSecretResponse.manual != undefined) {
                jwtSecret = jwtSecretResponse.manual;
            } else {
                generateJwtSecretLength = jwtSecretResponse.gen;
            }
            jwtExpirationMinutes = await promptjwtExpirationMinutes();
        }
        if (!jwtSecret) {
            jwtSecret = randomString(generateJwtSecretLength);
        }

        // .env
        let envContent = `MONGO_URI=${finalUri}\nPORT=${finalPort}\nJWT_SECRET=${jwtSecret}\n`;
        fs.writeFileSync(path.resolve(process.cwd(), '.env'), envContent);
        console.log('.env file created');

        const settings = {
            port: parseInt(finalPort, 10),
            jwtExpirationMinutes
        };
        fs.writeFileSync(
            path.resolve(process.cwd(), 'settings.json'),
            JSON.stringify(settings, null, 2)
        );
        console.log('settings.json file created');
    } catch (err) {
        console.error('Error during setup:', err);
        process.exit(1);
    }
}

main();
