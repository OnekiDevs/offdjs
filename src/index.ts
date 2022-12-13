import {
    BitFieldResolvable,
    GatewayIntentsString,
    IntentsBitField,
    Message,
    BaseInteraction,
    RESTPostAPIApplicationCommandsJSONBody,
    ApplicationCommandDataResolvable,
    ApplicationCommand
} from 'discord.js'
import { join, dirname } from 'node:path'
import Client, { ClientOptions } from './Client.js'
import { config as envLoad } from 'dotenv'
import { ConfigurationOptions } from 'i18n'
import { fileURLToPath } from 'url'
import merge from 'just-extend'
export { Client, ClientOptions }
import { p } from './p.js'

/**
 * It takes a object and returns another object formatted for the discord api
 * @param {ApplicationCommandDataResolvable | ApplicationCommand} command - The object to parse
 * @returns {ApplicationCommandDataResolvable} - The command in the correct format to send to the API
 * @example parseCommand({
 *     name: 'say',
 *     options: [{
 *         name: 'text',
 *         description: 'text to say',
 *         required: true
 *     }]
 * })
 * // {
 * //     type: 1,
 * //     name: 'say',
 * //     description: '...',
 * //     options: [{
 * //         name: 'text',
 * //         description: 'text to say',
 * //         required: true,
 * //         type: 3
 * //    }]
 * // }
 */
export function parseAPICommand(
    command: ApplicationCommandDataResolvable | ApplicationCommand
): RESTPostAPIApplicationCommandsJSONBody {
    if (!(command as { name: string }).name) throw new Error('Command must have a name')
    if (!(command as { description: string }).description) (command as { description: string }).description = '...'
    return p(command as ApplicationCommandDataResolvable)
}

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
        directory: join(dirname(fileURLToPath(import.meta.url)), '..', 'locales')
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
const client = new Client(
    merge(true, {}, config, {
        intents: config.intents ?? [IntentsBitField.Flags.Guilds],
        routes: {
            commands: config.routes?.commands || join(cwd, config.root ?? '', 'commands'),
            events: config.routes?.events || join(cwd, config.root ?? '', 'events'),
            interactions: config.routes?.interactions || join(cwd, config.root ?? '', 'interactions')
        }
    }) as ClientOptions
)
export default client

/**
 * It takes an interaction and returns a function that takes a phrase and returns a translation
 * @param {Interaction} interaction - Interaction - The interaction object that contains the locale and client.
 * @returns {(phrase: string, params?: object): string }
 */
export function Translator(interaction: BaseInteraction | Message<true>): (phrase: string, params?: object) => string {
    let lang: string = interaction instanceof BaseInteraction ? interaction.locale : interaction.guild.preferredLocale
    const i18n = client.i18n

    /**
     * It takes a phrase and an optional object of parameters, and returns a translated string
     * @param {string} phrase - The phrase to translate
     * @param {object} [params] - An object whit the parameters to replace
     * @returns {string} - The function translate is being returned.
     */
    return (phrase: string, params?: object): string => {
        return i18n.__mf({ phrase, locale: lang }, params)
    }
}
