import { IntentsBitField } from 'discord.js'
import { join } from 'node:path'
import Client from './classes/Client.js'
import { config as envLoad } from 'dotenv'
import { ConfigurationOptions } from 'i18n'
import path from 'path'
import { fileURLToPath } from 'url'
export * from './utils.js'

// load environment variables
envLoad()
// current work directory
const cwd = process.cwd()

// create config object
let config = {
    intents: [IntentsBitField.Flags.Guilds],
    root: './',
    i18n: {
        directory: join(path.dirname(fileURLToPath(import.meta.url)), '..', 'locales')
    } as ConfigurationOptions
}
try {
    // import config from oneki.config.js
    const iconfig = await import('file://' + join(cwd, 'oneki.config.js'))
    config = {
        ...config,
        ...iconfig.default
    }
} catch {}

// create client
export default new Client({
    intents: config.intents,
    i18n: config.i18n,
    routes: {
        commands: join(cwd, config.root, 'commands'),
        events: join(cwd, config.root, 'events'),
        components: join(cwd, config.root, 'components')
    }
})

export type Config = typeof config
