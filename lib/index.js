import { IntentsBitField } from 'discord.js';
import { join } from 'node:path';
import Client from './classes/Client.js';
import { config as envLoad } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
export * from './utils.js';
export * from './classes/Command.js';
export * from './classes/Component.js';
export { Client };
envLoad();
const cwd = process.cwd();
let config = {
    intents: [IntentsBitField.Flags.Guilds],
    root: './',
    i18n: {
        directory: join(path.dirname(fileURLToPath(import.meta.url)), '..', 'locales')
    }
};
try {
    const iconfig = await import('file://' + join(cwd, 'oneki.config.js'));
    config = {
        ...config,
        ...iconfig.default
    };
}
catch { }
export default new Client({
    intents: config.intents,
    i18n: config.i18n,
    routes: {
        commands: join(cwd, config.root, 'commands'),
        events: join(cwd, config.root, 'events'),
        components: join(cwd, config.root, 'components')
    }
});
