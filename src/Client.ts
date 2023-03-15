import i18n, { ConfigurationOptions } from 'i18n'
import { parseAPICommand } from './index.js'
import { readdirSync } from 'fs'
import { join } from 'path'
import {
    ApplicationCommand,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Client as BaseClient,
    ClientOptions as BaseClientOptions,
    Interaction,
    InteractionType,
    RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js'

type syncCommands = 'none' | 'upload' | 'strict'
export interface ClientOptions extends BaseClientOptions {
    // constants: ClientConstants
    routes: {
        commands: string
        events: string
        interactions: string
    }
    i18n: ConfigurationOptions
    interactionSplit: string | RegExp
    syncCommands: syncCommands
}

export default class Client extends BaseClient<true> {
    i18n = i18n
    // commands: CommandManager
    routes = {
        interactions: join(process.cwd(), 'interactions'),
        commands: join(process.cwd(), 'commands'),
        events: join(process.cwd(), 'events'),
    }
    interactionSplit: string | RegExp = ':'
    syncCommandsConfig: syncCommands

    constructor(options: ClientOptions) {
        super(options)

        this.i18n.configure(options.i18n)

        this.routes.interactions = options.routes.interactions
        this.routes.commands = options.routes.commands
        this.routes.events = options.routes.events
        this.interactionSplit = options.interactionSplit
        this.syncCommandsConfig = options.syncCommands

        this.once('ready', () => this.#onReady())
    }

    public override async login(token?: string | undefined): Promise<string> {
        this.initializeEventListener(this.routes.events)
        // if (e) console.log('\x1b[35m%s\x1b[0m', 'Eventos Cargados!!')
        return super.login(token)
    }

    async syncCommands(): Promise<[number, number, number, number]> {
        if (typeof this.syncCommandsConfig !== 'string' || this.syncCommandsConfig === 'none') return [0, 0, 0, 0]
        const remoteCommands = await this.application.commands.fetch()
        const localCommands = [
            ...(await this.#getJsonCommands(this.routes.commands)),
            ...(await this.#getJSCommands(this.routes.commands)),
        ]
        const toCreate: RESTPostAPIApplicationCommandsJSONBody[] = []
        const toUpdate: RESTPostAPIApplicationCommandsJSONBody[] = []
        const toDelete: ApplicationCommand[] = []
        const toDownload: ApplicationCommand[] = []

        for (const command of localCommands) {
            const remoteCommand = remoteCommands.find((c) => c.name === command.name)
            if (
                remoteCommand &&
                JSON.stringify(parseAPICommand(remoteCommand), (_, v) => (typeof v === 'bigint' ? v.toString() : v)) !==
                    JSON.stringify(parseAPICommand(command))
            )
                toUpdate.push(command)
            else if (!remoteCommand) toCreate.push(command)
        }

        for (const command of toCreate) await this.application.commands.create(command)
        for (const command of toUpdate) await this.application.commands.create(command)

        if (this.syncCommandsConfig === 'strict')
            for (const command of remoteCommands.values())
                if (!localCommands.find((c) => c.name === command.name)) toDelete.push(command)

        for (const command of toDelete) await command.delete()

        return [toCreate.length, toUpdate.length, toDelete.length, toDownload.length]
    }

    async #onReady() {
        const [c, u, d] = await this.syncCommands()
        if (this.syncCommandsConfig !== 'none')
            console.log('\x1b[35m%s\x1b[0m', `Commands Synced!! [${c} created, ${u} updated, ${d} deleted]`)
        // TODO: activar
        this.on('interactionCreate', (interaction: Interaction) => {
            // isChatInputCommand
            if (interaction.isChatInputCommand()) {
                const names = getFullCommandName(interaction).filter(Boolean)
                executeRouteCommand(interaction, this.routes.interactions, ...names)
            } else if (interaction.isButton()) {
                executeRouteCommand(
                    interaction,
                    this.routes.interactions,
                    ...interaction.customId.split(this.interactionSplit),
                )
            } else if (interaction.isAnySelectMenu()) {
                executeRouteCommand(
                    interaction,
                    this.routes.interactions,
                    ...interaction.customId.split(this.interactionSplit),
                )
            } else if (interaction.type === InteractionType.ModalSubmit) {
                executeRouteCommand(
                    interaction,
                    this.routes.interactions,
                    ...interaction.customId.split(this.interactionSplit),
                )
            } else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
                const names: string[] = getFullCommandName(interaction).filter(Boolean)
                executeRouteCommand(
                    interaction,
                    this.routes.interactions,
                    ...names,
                    interaction.options.getFocused(true).name,
                )
            } else if (interaction.isMessageContextMenuCommand()) {
                executeRouteCommand(interaction, this.routes.interactions, interaction.commandName)
            } else if (interaction.isUserContextMenuCommand()) {
                executeRouteCommand(interaction, this.routes.interactions, interaction.commandName)
            }
        })

        // console.log('\x1b[31m%s\x1b[0m', `${this.user?.username} ready!!!`)
    }

    async #getJsonCommands(path: string) {
        const commands: RESTPostAPIApplicationCommandsJSONBody[] = []
        let dir
        try {
            dir = readdirSync(path, { withFileTypes: true })
        } catch (error) {
            if ((error as Error).message.startsWith('ENOENT: no such file or directory')) return commands
            throw error
        }
        for (const file of dir) {
            if (file.isFile() && file.name.endsWith('.json')) {
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

    async #getJSCommands(path: string) {
        const commands: RESTPostAPIApplicationCommandsJSONBody[] = []
        let dir
        try {
            dir = readdirSync(path, { withFileTypes: true })
        } catch (error) {
            if ((error as Error).message.startsWith('ENOENT: no such file or directory')) return commands
            throw error
        }
        for (const file of dir) {
            if (file.isFile() && file.name.endsWith('.js')) {
                await import(join(path, file.name))
                    .then((cmd) => commands.push(parseAPICommand(cmd.default)))
                    .catch((err) => {
                        if (!err.message.startsWith('Cannot find module')) throw err
                    })
            } else if (file.isDirectory()) {
                const nc = await this.#getJSCommands(join(path, file.name))
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
                            .filter((f) => f.endsWith('.js'))
                            .forEach(async (f) => {
                                const event = await import('file:///' + join(path, file.name, f))
                                const [eventName] = f.split('.')
                                this.on(eventName as string, (...args) => event.default(...args))
                            })
                    } else if (file.name.endsWith('.js')) {
                        const event = await import('file:///' + join(path, file.name))
                        const [eventName] = file.name.split('.')
                        this.on(eventName as string, (...args) => event.default(...args))
                    }
                }),
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
                    else if (interaction.isButton()) f.buttonInteraction?.(interaction, args)
                    else if (interaction.isChannelSelectMenu()) f.channelSelectMenuInteraction?.(interaction, args)
                    else if (interaction.isMentionableSelectMenu())
                        f.mentionableSelectMenuInteraction?.(interaction, args)
                    else if (interaction.isRoleSelectMenu()) f.roleSelectMenuInteraction?.(interaction, args)
                    else if (interaction.isUserSelectMenu()) f.userSelectMenuInteraction?.(interaction, args)
                    else if (interaction.isStringSelectMenu()) f.stringSelectMenuInteraction?.(interaction, args)
                    else if (interaction.type === InteractionType.ModalSubmit)
                        f.modalSubmitInteraction?.(interaction, args)
                    else if (interaction.type === InteractionType.ApplicationCommandAutocomplete)
                        f.autocompleteInteraction?.(interaction)
                    else if (interaction.isMessageContextMenuCommand())
                        f.messageContextMenuCommandInteraction?.(interaction)
                    else if (interaction.isUserContextMenuCommand()) f.userContextMenuCommandInteraction?.(interaction)
                    f.default?.(interaction)
                })
                .catch((e) => {
                    if (!e.message.startsWith('Cannot find module')) throw e
                }),
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
