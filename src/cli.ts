#!/usr/bin/env node
const { default: pkg } = await import(import.meta.resolve('../package.json'), {
    with: { type: 'json' },
})
import {
    IntentsBitField,
    GatewayIntentsString,
    BitFieldResolvable,
} from 'discord.js'
import { pathToFileURL } from 'node:url'
import { Command } from 'commander'
import client from './index.js'
import { join } from 'node:path'

const cmd = new Command()
    .argument('[main]', 'main file')
    .option(
        '-t, --token <token>',
        'discord token. You can also set it in the DISCORD_TOKEN env',
    )
    .option(
        '-i, --intents <intents...>',
        'intents like a `INTENT_NAME`, `IntentName` or `123`. You can also set it in the OFFDJS_INTENTS env',
        'GUILDS, GUILD_MESSAGES',
    )
    .option(
        '-r, --root <root>',
        'root of program. You can also set it in the OFFDJS_ROOT env',
        '.',
    )
    .option(
        '-V, --verbose',
        'verbose mode. You can also set it in the OFFDJS_VERBOSE env',
        false,
    )
    .version(pkg.version, '-v, --version')
    .parse()

const verbose =
    process.env.OFFDJS_VERBOSE === 'true' || (cmd.opts().verbose as boolean)

function resolveIntents(i: string) {
    return i.split(',').map(
        i =>
            i
                .trim()
                .split('_')
                .map(s => s && s[0].toUpperCase() + s.slice(1).toLowerCase())
                .join('') as BitFieldResolvable<GatewayIntentsString, number>,
    )
}
client.options.intents = new IntentsBitField(
    IntentsBitField.resolve(
        resolveIntents(
            process.env.OFFDJS_INTENTS || cmd.opts().intents || '',
        ) || 0,
    ),
)
if (verbose)
    console.log(
        'Intents used:',
        client.options.intents.toArray().join(', ') || 'none',
    )
client.options.root = process.env.OFFDJS_ROOT || cmd.opts().root
if (verbose) console.log('Root:', client.options.root)
const token = process.env.OFFDJS_ROOT || cmd.opts().token
if (!token) {
    console.error('Token is required')
    process.exit(1)
}
const tokenFrom = process.env.OFFDJS_ROOT ? 'env' : 'command line'
if (verbose) console.log(`Token used from ${tokenFrom}`)
await client.login(token)
if (cmd.args[0]) {
    if (verbose) console.log('Loading main file:', cmd.args[0])
    await import(pathToFileURL(join(process.cwd(), cmd.args[0])).toString())
}
