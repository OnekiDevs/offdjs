import i18n, { ConfigurationOptions } from 'i18n'
import { parseAPICommand } from '../utils.js'
import { createRequire } from 'module'
import { readdirSync } from 'fs'
import { join } from 'path'
import {
    ApplicationCommand,
    ApplicationCommandData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Client as BaseClient,
    ClientOptions as BaseClientOptions,
    Interaction,
    InteractionType,
    RESTPostAPIApplicationCommandsJSONBody
} from 'discord.js'

const version = createRequire(import.meta.url)('../../package.json').version

export interface ClientOptions extends BaseClientOptions {
    // constants: ClientConstants
    routes: {
        commands: string
        events: string
        interactions: string
    }
    i18n: ConfigurationOptions
    interactionSplit: string | RegExp
}

export default class Client extends BaseClient<true> {
    version: string
    i18n = i18n
    // commands: CommandManager
    routes = {
        interactions: join(process.cwd(), 'interactions'),
        commands: join(process.cwd(), 'commands')
    }
    interactionSplit: string | RegExp = ':'

    constructor(options: ClientOptions) {
        super(options)

        // this.commands = new CommandManager(options.routes.commands)

        this.i18n.configure(options.i18n)
        this.version = version ?? '1.0.0'

        this.routes.interactions = options.routes.interactions
        this.routes.commands = options.routes.commands
        this.interactionSplit = options.interactionSplit

        this.initializeEventListener(options.routes.events).then((c) => {
            if (c) console.log('\x1b[35m%s\x1b[0m', 'Eventos Cargados!!')
        })

        this.once('ready', () => this.#onReady())
    }

    async syncCommands() {
        const remoteCommands = await this.application.commands.fetch()
        const localCommands = await this.#getJsonCommands(join(process.cwd(), 'commands'))
        const toCreate: RESTPostAPIApplicationCommandsJSONBody[] = []
        const toDelete: ApplicationCommand[] = []

        for (const command of localCommands) {
            const remoteCommand = remoteCommands.find((c) => c.name === command.name)
            if (
                remoteCommand &&
                JSON.stringify(parseAPICommand(remoteCommand as ApplicationCommandData)) !== JSON.stringify(command)
            )
                toCreate.push(command)
        }

        for (const command of remoteCommands.values()) {
            if (!localCommands.find((c) => c.name === command.name)) toDelete.push(command)
        }

        for (const command of toCreate) await this.application.commands.create(command)

        for (const command of toDelete) await command.delete()
    }

    async #onReady() {
        await this.syncCommands()
        console.log('\x1b[35m%s\x1b[0m', 'Commands Synced!!')
        // TODO: activar
        this.on('interactionCreate', (interaction: Interaction) => {
            // isChatInputCommand
            if (interaction.isChatInputCommand()) {
                const names: string[] = getFullCommandName(interaction).filter(Boolean)
                executeRouteCommand(interaction, this.routes.interactions, ...names)
            } else if (interaction.isButton()) {
                executeRouteCommand(
                    interaction,
                    this.routes.interactions,
                    ...interaction.customId.split(this.interactionSplit)
                )
            } else if (interaction.isSelectMenu()) {
                executeRouteCommand(
                    interaction,
                    this.routes.interactions,
                    ...interaction.customId.split(this.interactionSplit)
                )
            } else if (interaction.type === InteractionType.ModalSubmit) {
                executeRouteCommand(
                    interaction,
                    this.routes.interactions,
                    ...interaction.customId.split(this.interactionSplit)
                )
            } else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
                const names: string[] = getFullCommandName(interaction).filter(Boolean)
                executeRouteCommand(
                    interaction,
                    this.routes.interactions,
                    ...names,
                    interaction.options.getFocused(true).name
                )
            } else if (interaction.isMessageContextMenuCommand()) {
                executeRouteCommand(interaction, this.routes.interactions, interaction.commandName)
            } else if (interaction.isUserContextMenuCommand()) {
                executeRouteCommand(interaction, this.routes.interactions, interaction.commandName)
            }
        })

        console.log('\x1b[31m%s\x1b[0m', `${this.user?.username} ${this.version} ready!!!`)
    }

    async #getJsonCommands(path: string) {
        const commands: RESTPostAPIApplicationCommandsJSONBody[] = []
        const dir = readdirSync(path, { withFileTypes: true })
        for (const file of dir) {
            if (file.isFile()) {
                await import(join(path, file.name), { assert: { type: 'json' } })
                    .then((json) => commands.push(parseAPICommand(json.default)))
                    .catch((err) => {
                        if (!err.message.startsWith('Cannot find module')) throw err
                    })
            } else if (file.isDirectory()) {
                const nc = await this.#getJsonCommands(join(path, file.name))
                commands.push(...nc)
            }
        }

        return commands
    }

    async initializeEventListener(path: string) {
        try {
            const r = await Promise.all(
                readdirSync(path, { withFileTypes: true }).map(async (file) => {
                    if (file.isDirectory()) {
                        readdirSync(join(path, file.name))
                            .filter((f) => f.endsWith('.event.js'))
                            .forEach(async (f_1) => {
                                const event = await import('file:///' + join(path, file.name, f_1))
                                const [eventName] = f_1.split('.')
                                this.on(eventName as string, (...args) => event.default(...args))
                            })
                    } else if (file.name.endsWith('.event.js')) {
                        const event_2 = await import('file:///' + join(path, file.name))
                        const [eventName_1] = file.name.split('.')
                        this.on(eventName_1 as string, (...args_1) => event_2.default(...args_1))
                    }
                })
            )
            return r.length
        } catch (error) {
            return Promise.resolve()
        }
    }
}

function executeRouteCommand(interaction: Interaction, path: string, ...args: string[]) {
    try {
        processRoutesFileNames(path, ...args).map((i) =>
            import(i)
                .then((f) => {
                    if (interaction.isChatInputCommand()) f.chatInputCommandInteraction?.(interaction)
                    else if (interaction.isButton()) f.buttonInteraction?.(interaction, ...args)
                    else if (interaction.isSelectMenu()) f.selectMenuInteraction?.(interaction, ...args)
                    else if (interaction.type === InteractionType.ModalSubmit)
                        f.modalSubmitInteraction?.(interaction, ...args)
                    else if (interaction.type === InteractionType.ApplicationCommandAutocomplete)
                        f.autocompleteInteraction?.(interaction)
                    else if (interaction.isMessageContextMenuCommand())
                        f.messageContextMenuCommandInteraction?.(interaction)
                    else if (interaction.isUserContextMenuCommand()) f.userContextMenuCommandInteraction?.(interaction)
                    f.default?.(interaction)
                })
                .catch((e) => {
                    if (!e.message.startsWith('Cannot find module')) throw e
                })
        )
    } catch (error) {
        // deepscan-disable-line USELESS_CATCH
        throw error
    }
}

function processRoutesFileNames(path: string, ...args: string[]) {
    const routes: string[] = [],
        names: string[] = []
    for (const i of args) {
        names.push(i)
        routes.push(join(path, names.join('/') + '.js'))
    }
    return routes
}

function getFullCommandName(interaction: ChatInputCommandInteraction | AutocompleteInteraction) {
    let name = interaction.commandName,
        subcommandGroup,
        subcommand
    try {
        subcommand = interaction.options.getSubcommand()
    } catch {}

    try {
        subcommandGroup = interaction.options.getSubcommandGroup()
    } catch {}

    return [name, subcommandGroup ?? '', subcommand ?? '']
}
