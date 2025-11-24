#!/usr/bin/env node
import { Effect, pipe } from 'effect'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'
import { GatewayIntentsString, IntentsBitField } from 'discord.js'
import { Cli, CliLive } from './services/cli'
import { Env, EnvLive } from './services/env'
import { Client, ClientLive } from './services/client'

export const resolveIntents = (raw: string) =>
    Effect.sync(() => {
        const normalized = `${raw}`.split(',').map(i =>
            i
                .trim()
                .split('_')
                .map(s => s && s[0].toUpperCase() + s.slice(1).toLowerCase())
                .join(''),
        )

        return new IntentsBitField(
            IntentsBitField.resolve(normalized as GatewayIntentsString[]),
        )
    })

export const Main = pipe(
    Effect.gen(function* (_) {
        const cli = yield* _(Cli)
        const env = yield* _(Env)

        const verbose = env.get('OFFDJS_VERBOSE') === 'true' || cli.opts.verbose

        const intents = yield* _(
            resolveIntents(env.get('OFFDJS_INTENTS') || cli.opts.intents || ''),
        )

        if (verbose) {
            yield* _(
                Effect.sync(() =>
                    console.log('Intents used:', intents.toArray().join(', ')),
                ),
            )
        }

        const root = env.get('OFFDJS_ROOT') || cli.opts.root

        if (verbose) {
            yield* _(Effect.sync(() => console.log('Root:', root)))
        }

        const token = env.get('DISCORD_TOKEN') || cli.opts.token

        if (!token) {
            return yield* _(Effect.fail(new Error('Token is required')))
        }

        const tokenFrom = env.get('DISCORD_TOKEN') ? 'env' : 'command line'
        if (verbose) {
            yield* _(
                Effect.sync(() => console.log(`Token used from ${tokenFrom}`)),
            )
        }

        const discord = yield* _(Client)
        yield* _(discord.login(token, { verbose, intents, root }))

        if (cli.args[0]) {
            if (verbose) {
                yield* _(
                    Effect.sync(() =>
                        console.log('Loading main file:', cli.args[0]),
                    ),
                )
            }

            const path = pathToFileURL(
                join(process.cwd(), cli.args[0]),
            ).toString()
            yield* _(Effect.tryPromise(() => import(path)))
        }
    }),
)
Effect.runPromise(
    Main.pipe(
        Effect.provide(CliLive),
        Effect.provide(EnvLive),
        Effect.provide(ClientLive),
    ),
)
