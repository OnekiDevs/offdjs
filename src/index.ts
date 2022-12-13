import { BitFieldResolvable, GatewayIntentsString, IntentsBitField } from 'discord.js'
import { join } from 'node:path'
import Client, { ClientOptions } from './classes/Client.js'
import { config as envLoad } from 'dotenv'
import { ConfigurationOptions } from 'i18n'
import path from 'path'
import { fileURLToPath } from 'url'
import merge from 'just-extend'
export * from './utils.js'
export { Client, ClientOptions }

// load environment variables
envLoad()
// current work directory
const cwd = process.cwd()

export type Config = {
    root?: string
    intents: BitFieldResolvable<GatewayIntentsString, number>
} & Partial<ClientOptions>

// create config object
let config: Config = {
    intents: [],
    root: './',
    i18n: {
        directory: join(path.dirname(fileURLToPath(import.meta.url)), '..', 'locales')
    } as ConfigurationOptions,
    interactionSplit: ':',
    routes: {
        commands: '',
        events: '',
        interactions: ''
    },
    syncCommands: 'upload'
}
try {
    // import config from oneki.config.js
    const iconfig = await import('file://' + join(cwd, 'offdjs.config.js'))
    config = merge(true, config, iconfig.default) as typeof config
} catch {}

// if (config.i18n === true) {
//     config.i18n = {
//         locales: ['en'],
//         directory: join(cwd, 'lang'),
//         defaultLocale: 'en',
//         retryInDefaultLocale: true,
//         objectNotation: true,
//         fallbacks: {
//             'en-*': 'en',
//             'es-*': 'es'
//         },
//         logWarnFn: (msg) => console.warn('WARN i18n', msg),
//         logErrorFn: (msg) => console.error('ERROR i18n', msg),
//         missingKeyFn: (locale: string, value: string) => {
//             console.warn(`Missing translation for "${value}" in "${locale}"`)
//             return value ?? '_'
//         },
//         mustacheConfig: {
//             tags: ['{{', '}}'],
//             disable: false
//         }
//     }
// }
// create client
export default new Client(
    merge(true, {}, config, {
        intents: config.intents ?? [IntentsBitField.Flags.Guilds],
        routes: {
            commands: config.routes?.commands || join(cwd, config.root ?? '', 'commands'),
            events: config.routes?.events || join(cwd, config.root ?? '', 'events'),
            interactions: config.routes?.interactions || join(cwd, config.root ?? '', 'interactions')
        }
    }) as ClientOptions
)
