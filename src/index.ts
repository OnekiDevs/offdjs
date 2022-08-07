import { IntentsBitField } from 'discord.js'
import { join } from 'node:path'
import Client from './utils/classes.js'
import { config as envLoad } from 'dotenv'
import { ConfigurationOptions } from 'i18n'

// load environment variables
envLoad()
// current work directory
const cwd = process.cwd()

// create config object
let config = {
    intents: [IntentsBitField.Flags.Guilds],
    root: './',
    i18n: {} as ConfigurationOptions
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
        oldCommands: join(cwd, config.root, 'oldCommands'),
        events: join(cwd, config.root, 'events'),
        components: join(cwd, config.root, 'components')
    }
})

export type Config = typeof config
