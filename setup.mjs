import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
const prompt = (inquirer.prompt ? inquirer.prompt : inquirer.default.prompt);

const DEFAULTS = {
    DB_HOST: '127.0.0.1',
    DB_USER: 'root',
    DB_PASSWORD: 'root',
    DB_DATABASE: 'sakila',
    DB_PORT: '3306',
    LOG_TO_FILE: true
};

async function main() {
    try {
        const answers = await prompt([
            { type: 'input', name: 'DB_HOST', message: 'MySQL Host:', default: DEFAULTS.DB_HOST },
            { type: 'input', name: 'DB_USER', message: 'MySQL User:', default: DEFAULTS.DB_USER },
            { type: 'password', name: 'DB_PASSWORD', message: 'MySQL Password:', default: DEFAULTS.DB_PASSWORD, mask: '*' },
            { type: 'input', name: 'DB_DATABASE', message: 'MySQL Database:', default: DEFAULTS.DB_DATABASE },
            {
                type: 'list',
                name: 'DB_PORT_CHOICE',
                message: 'MySQL Port:',
                choices: [
                    { name: '32768 (remote)', value: '32768' },
                    { name: '3306 (default MySQL)', value: '3306' },
                    { name: 'Custom', value: 'custom' }
                ],
                default: DEFAULTS.DB_PORT === '32768' ? 0 : (DEFAULTS.DB_PORT === '3306' ? 1 : 2)
            },
            {
                type: 'input',
                name: 'DB_PORT',
                message: 'Enter custom MySQL port:',
                when: (answers) => answers.DB_PORT_CHOICE === 'custom',
                validate: input => !isNaN(parseInt(input, 10)) && parseInt(input, 10) > 0 ? true : 'Please enter a valid port number',
                default: DEFAULTS.DB_PORT
            },
            {
                type: 'list',
                name: 'EXPRESS_PORT_CHOICE',
                message: 'Express.js Port:',
                choices: [
                    { name: '3000', value: 3000 },
                    { name: '3030', value: 3030 },
                    { name: '6969', value: 6969 },
                    { name: 'Custom', value: 'custom' }
                ],
                default: 2
            },
            {
                type: 'input',
                name: 'EXPRESS_PORT',
                message: 'Enter custom Express.js port:',
                when: (answers) => answers.EXPRESS_PORT_CHOICE === 'custom',
                validate: input => !isNaN(parseInt(input, 10)) && parseInt(input, 10) > 0 ? true : 'Please enter a valid port number',
                default: 6969
            },
            { type: 'confirm', name: 'LOG_TO_FILE', message: 'Save logfiles to disk?', default: DEFAULTS.LOG_TO_FILE },
            {
                type: 'list',
                name: 'MAX_TOKEN_TIME_CHOICE',
                message: 'SessionToken Expiration time:',
                choices: [
                    { name: '1 hour', value: 60 },
                    { name: '1 day', value: 60 * 24 },
                    { name: '1 week', value: 60 * 24 * 7 },
                    { name: 'Custom (input in minutes)', value: 'custom' }
                ],
                default: 0
            },
            {
                type: 'input',
                name: 'MAX_TOKEN_TIME',
                message: 'Enter custom expiration time in minutes:',
                when: (answers) => answers.MAX_TOKEN_TIME_CHOICE === 'custom',
                validate: input => !isNaN(parseInt(input, 10)) && parseInt(input, 10) > 0 ? true : 'Please enter a valid number of minutes',
            }
        ]);
        const finalPort = answers.DB_PORT_CHOICE === 'custom' ? answers.DB_PORT : answers.DB_PORT_CHOICE;
        const finalTokenTime = answers.MAX_TOKEN_TIME_CHOICE === 'custom' ? parseInt(answers.MAX_TOKEN_TIME, 10) : answers.MAX_TOKEN_TIME_CHOICE;
        const finalExpressPort = answers.EXPRESS_PORT_CHOICE === 'custom' ? parseInt(answers.EXPRESS_PORT, 10) : answers.EXPRESS_PORT_CHOICE;

        // Write .env
        const envContent = `DB_HOST=${answers.DB_HOST}\nDB_USER=${answers.DB_USER}\nDB_PASSWORD=${answers.DB_PASSWORD}\nDB_DATABASE=${answers.DB_DATABASE}\nDB_PORT=${finalPort}\n`;
        fs.writeFileSync(path.resolve(process.cwd(), '.env'), envContent);
        console.log('.env file created');

        // Write settings.json
        const settings = {
            logToFile: answers.LOG_TO_FILE,
            maxTokenTime: finalTokenTime,
            maxRefreshTokenTime: finalTokenTime * 2,
            expressPort: finalExpressPort
        };
        fs.writeFileSync(path.resolve(process.cwd(), 'settings.json'), JSON.stringify(settings, null, 2));
        console.log('settings.json file created');
        if (answers.MAX_TOKEN_TIME_CHOICE === 'custom') {
            console.log('Custom expiration time set. Please input the value in minutes.');
        }
    } catch (err) {
        console.error('Error during setup:', err);
        process.exit(1);
    }
}

main();