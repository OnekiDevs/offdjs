#!/usr/bin/env node
const { default: pkg } = await import('../package' + '.json', { assert: { type: 'json' } })
import { IntentsBitField, GatewayIntentsString } from 'discord.js'
import { pathToFileURL } from 'node:url'
import { program } from 'commander'
import client from './index.js'
import { join } from 'path'

program
    .argument('[main]', 'main file')
    .option('-i, --intents [intents...]', 'intents', [process.env.DISCORD_INTENTS ?? `${3}`])
    .option('-r, --root [root]', 'root', process.env.OFFDJS_ROOT ?? '.')
    .option('-t, --token [token]', 'token', process.env.DISCORD_TOKEN)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .version(pkg.version as string)
    .parse()

client.options.intents = new IntentsBitField(
    IntentsBitField.resolve(
        (program.opts().intents as string[]).map(i =>
            i
                .split('_')
                .map(s => s[0].toUpperCase() + s.slice(1).toLowerCase())
                .join(''),
        ) as GatewayIntentsString[],
    ),
)
client.options.root = program.opts().root as string
await client.login(program.opts().token as string)

if (program.args[0]) await import(pathToFileURL(join(process.cwd(), program.args[0])).toString())
