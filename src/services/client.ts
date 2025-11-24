import { Context, Effect, Layer } from 'effect'
import { OFFDJSClient } from '../OFFDJSClient'
import { IntentsBitField } from 'discord.js'

export class Client extends Context.Tag('Client')<
    Client,
    {
        client: OFFDJSClient<true>
        login: (
            token: string,
            opts: {
                verbose?: boolean
                intents?: IntentsBitField
                root?: string
            },
        ) => Effect.Effect<string>
    }
>() {}

export const ClientLive = Layer.effect(
    Client,
    Effect.sync(() => {
        const raw = new OFFDJSClient({
            intents:
                IntentsBitField.Flags.Guilds |
                IntentsBitField.Flags.GuildMembers,
            root: '.',
        })

        return {
            client: raw as unknown as OFFDJSClient<true>,
            login: (token, opts) =>
                Effect.tryPromise(() => raw.login(token, opts)).pipe(
                    Effect.catchAll(Effect.die),
                ),
        }
    }),
)
