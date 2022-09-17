import { IntentsBitField } from 'discord.js';
import { join } from 'node:path';
import Client from './classes/Client.js';
import { config as envLoad } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Command from './classes/Command.js';
export * from './classes/Command.js';
export * from './utils.js';
export * from './classes/Component.js';
export { Client, Command };
envLoad();
const cwd = process.cwd();
let config = {
    intents: [IntentsBitField.Flags.Guilds],
    root: './',
    i18n: {
        directory: join(path.dirname(fileURLToPath(import.meta.url)), '..', 'locales'),
    },
};
try {
    const iconfig = await import('file://' + join(cwd, 'offdjs.config.js'));
    config = {
        ...config,
        ...iconfig.default,
    };
}
catch { }
if (config.i18n === true) {
    config.i18n = {
        locales: ['en'],
        directory: join(cwd, 'lang'),
        defaultLocale: 'en',
        retryInDefaultLocale: true,
        objectNotation: true,
        fallbacks: {
            'en-*': 'en',
            'es-*': 'es',
        },
        logWarnFn: msg => console.warn('WARN i18n', msg),
        logErrorFn: msg => console.error('ERROR i18n', msg),
        missingKeyFn: (locale, value) => {
            console.warn(`Missing translation for "${value}" in "${locale}"`);
            return value ?? '_';
        },
        mustacheConfig: {
            tags: ['{{', '}}'],
            disable: false,
        },
    };
}
export default new Client({
    ...config,
    intents: config.intents ?? [IntentsBitField.Flags.Guilds],
    i18n: config.i18n,
    routes: {
        commands: join(cwd, config.root, 'commands'),
        events: join(cwd, config.root, 'events'),
        interactions: join(cwd, config.root, 'interactions'),
    },
});
