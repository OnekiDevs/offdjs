'use strict'

import { IntentsBitField } from 'discord.js'
import { join } from 'node:path'
import Client from './utils/classes'

console.log(process.cwd())

const cwd = process.cwd()
let config = {
    intents: [IntentsBitField.Flags.Guilds]
}

try {
    const iconfig = await import(`${cwd}/oneki.js`)
    config = {
        ...config,
        ...iconfig.default
    }
} catch {}
console.log(join(cwd, 'locales'))

export default new Client({
    intents: config.intents,
    i18n: {
        locales: ['en', 'es'],
        directory: join(cwd, 'locales'),
        defaultLocale: 'en',
        retryInDefaultLocale: true,
        objectNotation: true,
        fallbacks: {
            'en-*': 'en',
            'es-*': 'es'
        },
        logWarnFn: msg => console.warn('WARN _l', msg),
        logErrorFn: msg => console.error('ERROR _l', msg),
        missingKeyFn: (locale: string, value: string) => {
            // sendError(
            //     new Error(`Missing translation for "${value}" in "${locale}"`),
            //     join(import.meta.url, '..', '..', 'lang', locale + '.json')
            // )
            return value ?? '_'
        },
        mustacheConfig: {
            tags: ['{{', '}}'],
            disable: false
        }
        // mustacheConfig: {
        //     tags: ['{{', '}}'],
        //     disable: false
        // }
    },
    routes: {
        commands: join(cwd, 'commands'),
        oldCommands: join(cwd, 'oldCommands'),
        events: join(cwd, 'events'),
        components: join(cwd, 'components')
    }
})
