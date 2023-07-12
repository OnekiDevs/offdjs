#!/usr/bin/env node
import client from './index.js'
import { IntentsBitField, GatewayIntentsString } from 'discord.js'
import { program } from 'commander'

program
    .option('-i, --intents [intents...]', 'intents', [process.env.DISCORD_INTENTS ?? `${3}`])
    .option('-r, --root [root]', 'root', process.env.OFFDJS_ROOT ?? '.')
    .parse()

client.options.intents = new IntentsBitField(IntentsBitField.resolve((program.opts().intents as string[]).map(i => i.split('_').map(s => s[0].toUpperCase() + s.slice(1).toLowerCase()).join('')) as (GatewayIntentsString)[]))
client.options.root = program.opts().root as string

await client.login(program.opts().token as string)