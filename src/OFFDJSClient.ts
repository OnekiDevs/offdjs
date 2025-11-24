import { Effect } from 'effect'
import { IntentsBitField, Client, Events, ClientOptions } from 'discord.js'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

// caches importados igual que en tu código
import autocompleteCache from './cache/autocompletes.js'
import commandsCache from './cache/commands.js'
import contextCache from './cache/contexts.js'
import buttonsCache from './cache/buttons.js'
import modalsCache from './cache/modals.js'
import menusCache from './cache/menus.js'
import { registerEvents, formatName } from './utils.js'

export class OFFDJSClient<T extends boolean> extends Client<T> {
    declare options: Omit<ClientOptions, 'intents'> & {
        intents: IntentsBitField
        root: string
    }

    constructor(options: ClientOptions & { root?: string }) {
        super(options)
        this.options.root = options.root ?? '.'
    }

    loginEffect(
        token: string,
        {
            verbose,
            intents,
            root,
        }: {
            verbose?: boolean
            intents?: IntentsBitField
            root?: string
        } = {},
    ) {
        return Effect.gen(
            function* (_: Effect.Adapter) {
                if (intents) {
                    yield* _(
                        Effect.sync(() => {
                            this.options.intents = intents
                        }),
                    )
                }

                if (root) {
                    yield* _(
                        Effect.sync(() => {
                            this.options.root = root
                        }),
                    )
                }

                const root = join(process.cwd(), this.options.root)

                const load = (
                    label: string,
                    fn: () => Promise<Map<any, any>>,
                ) =>
                    Effect.flatMap(Effect.tryPromise(fn), m =>
                        verbose && m.size ?
                            Effect.sync(() => console.log(`${label}:`, m.size))
                        :   Effect.void,
                    )

                yield* _(
                    load('Autocompletes registered', () =>
                        autocompleteCache.register(
                            join(root, 'autocompletes'),
                            true,
                        ),
                    ),
                )
                yield* _(
                    load('Commands registered', () =>
                        commandsCache.register(join(root, 'commands'), true),
                    ),
                )
                yield* _(
                    load('Contexts registered', () =>
                        contextCache.register(join(root, 'contexts'), true),
                    ),
                )
                yield* _(
                    load('Buttons registered', () =>
                        buttonsCache.register(join(root, 'buttons'), true),
                    ),
                )
                yield* _(
                    load('Modals registered', () =>
                        modalsCache.register(join(root, 'modals'), true),
                    ),
                )
                yield* _(
                    load('Menus registered', () =>
                        menusCache.register(join(root, 'menus'), true),
                    ),
                )

                // registerEvents
                yield* _(
                    Effect.tryPromise(() =>
                        registerEvents(join(root, 'events'), this),
                    ).tap(eventCount =>
                        verbose && eventCount ?
                            Effect.sync(() =>
                                console.log('Events registered:', eventCount),
                            )
                        :   Effect.void,
                    ),
                )

                // login real
                const tokenResult: string = yield* _(
                    Effect.tryPromise(() => super.login(token)),
                )

                // cargar commands por archivo
                yield* _(
                    Effect.try(() => readdirSync(join(root, 'commands'))).pipe(
                        Effect.flatMap(files =>
                            Effect.forEach(files, file =>
                                Effect.gen(function* (_) {
                                    const mod = yield* _(
                                        Effect.tryPromise(
                                            () =>
                                                import(
                                                    pathToFileURL(
                                                        join(
                                                            root,
                                                            'commands',
                                                            file,
                                                        ),
                                                    ).href
                                                ),
                                        ),
                                    )

                                    return mod
                                }),
                            ),
                        ),
                    ),
                ).catchTag('Error', e =>
                    // ignorar "no such file" igual que tu código
                    e.message.includes('no such file') ?
                        Effect.void
                    :   Effect.fail(e),
                )

                // listeners
                this.on(Events.InteractionCreate, interaction => {
                    Effect.runFork(
                        Effect.sync(() => {
                            if (interaction.isChatInputCommand()) {
                                commandsCache
                                    .fetch(formatName(interaction))
                                    .forEach(h =>
                                        h(
                                            interaction,
                                            ...formatName(interaction).split(
                                                ':',
                                            ),
                                        ),
                                    )
                            } else if (interaction.isButton()) {
                                buttonsCache
                                    .fetch(interaction.customId)
                                    .forEach(h =>
                                        h(
                                            interaction,
                                            ...interaction.customId.split(':'),
                                        ),
                                    )
                            } else if (interaction.isModalSubmit()) {
                                modalsCache
                                    .fetch(interaction.customId)
                                    .forEach(h =>
                                        h(
                                            interaction,
                                            ...interaction.customId.split(':'),
                                        ),
                                    )
                            } else if (interaction.isAnySelectMenu()) {
                                menusCache
                                    .fetch(interaction.customId)
                                    .forEach(h =>
                                        h(
                                            interaction,
                                            ...interaction.customId.split(':'),
                                        ),
                                    )
                            } else if (interaction.isContextMenuCommand()) {
                                contextCache
                                    .fetch(interaction.commandName)
                                    .forEach(h => h(interaction))
                            } else if (interaction.isAutocomplete()) {
                                autocompleteCache
                                    .fetch(formatName(interaction))
                                    .forEach(h =>
                                        h(
                                            interaction,
                                            ...formatName(interaction).split(
                                                ':',
                                            ),
                                        ),
                                    )
                            }
                        }),
                    )
                })

                return tokenResult
            }.bind(this),
        )
    }

    // login estándar si alguien sigue usando APIs normales
    override login(token?: string, opts?: { verbose?: boolean; intents?: IntentsBitField; root?: string }) {
        return this.loginEffect(token!, opts).pipe(Effect.orDie, Effect.runPromise)

    }
}
