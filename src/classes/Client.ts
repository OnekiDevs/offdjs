import i18n, { ConfigurationOptions } from 'i18n'
import { parseAPICommand } from '../utils.js'
import { CommandData } from '../utils'
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
    RESTPostAPIApplicationCommandsJSONBody
} from 'discord.js'
const version = await import('../../' + 'package.json', { assert: { type: 'json' } }).then((i) => i.default.version)

type syncCommands = 'none' | 'local_to_remote' | 'local_to_remote_strict'
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
    version = version ?? '1.0.0'
    i18n = i18n
    // commands: CommandManager
    routes = {
        interactions: join(process.cwd(), 'interactions'),
        commands: join(process.cwd(), 'commands')
    }
    interactionSplit: string | RegExp = ':'
    syncCommandsConfig: syncCommands

    constructor(options: ClientOptions) {
        super(options)

        // this.commands = new CommandManager(options.routes.commands)

        this.i18n.configure(options.i18n)

        this.routes.interactions = options.routes.interactions
        this.routes.commands = options.routes.commands
        this.interactionSplit = options.interactionSplit
        this.syncCommandsConfig = options.syncCommands

        this.initializeEventListener(options.routes.events).then((c) => {
            if (c) console.log('\x1b[35m%s\x1b[0m', 'Eventos Cargados!!')
        })

        this.once('ready', () => this.#onReady())
    }

    async syncCommands() {
        if (typeof this.syncCommandsConfig !== 'string' || this.syncCommandsConfig === 'none') return
        const remoteCommands = await this.application.commands.fetch()
        const localCommands = [
            ...(await this.#getJsonCommands(join(process.cwd(), 'commands'))),
            ...(await this.#getJSCommands(join(process.cwd(), 'commands')))
        ]
        const toCreate: RESTPostAPIApplicationCommandsJSONBody[] = []
        const toDelete: ApplicationCommand[] = []

        for (const command of localCommands) {
            const remoteCommand = remoteCommands.find((c) => c.name === command.name)
            if (
                remoteCommand &&
                JSON.stringify(parseAPICommand(remoteCommand as CommandData)) !== JSON.stringify(command)
            )
                toCreate.push(command)
        }

        if (this.syncCommandsConfig === 'local_to_remote_strict')
            for (const command of remoteCommands.values())
                if (!localCommands.find((c) => c.name === command.name)) toDelete.push(command)

        for (const command of toCreate) await this.application.commands.create(command)

        if (this.syncCommandsConfig === 'local_to_remote_strict') for (const command of toDelete) await command.delete()
    }

    async #onReady() {
        await this.syncCommands()
        if (this.syncCommandsConfig !== 'none') console.log('\x1b[35m%s\x1b[0m', 'Commands Synced!!')
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
