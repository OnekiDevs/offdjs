import {
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Client as BaseClient,
    ClientOptions as BaseClientOptions,
    Interaction,
    InteractionType,
    ModalSubmitInteraction,
    SelectMenuInteraction
} from 'discord.js'
import { createRequire } from 'module'
import CommandManager from '../handlers/CommandManager.js'
import i18n, { ConfigurationOptions } from 'i18n'
import { join } from 'path'
import { readdirSync } from 'fs'

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
    commands: CommandManager
    routes = {
        interactions: process.cwd()
    }
    interactionSplit: string | RegExp = ':'

    constructor(options: ClientOptions) {
        super(options)

        this.commands = new CommandManager(options.routes.commands)

        this.i18n.configure(options.i18n)
        this.version = version ?? '1.0.0'

        this.routes.interactions = options.routes.interactions
        this.interactionSplit = options.interactionSplit

        this.initializeEventListener(options.routes.events).then(c => {
            if (c) console.log('\x1b[35m%s\x1b[0m', 'Eventos Cargados!!')
        })

        this.once('ready', () => this._onReady())
    }

    get embedFooter() {
        return {
            text: `${this.user?.username} Bot v${this.version}`,
            iconURL: this.user?.avatarURL() as string
        }
    }

    private async _onReady() {
        await this.commands.deploy()
        if (this.commands.size) console.log('\x1b[32m%s\x1b[0m', 'Comandos Desplegados!!')
        this.on('interactionCreate', (interaction: Interaction) => {
            // isChatInputCommand
            if (interaction.isChatInputCommand()) {
                const cm = this.commands.get(interaction.commandName)
                cm?.chatInputCommandInteraction(interaction as ChatInputCommandInteraction<'cached'>)
                const names: string[] = getFullCommandName(interaction).filter(Boolean)
                executeRouteCommand(interaction, this.routes.interactions, ...names)
            }

            if (interaction.isButton()) {
                const bt = this.commands.find(cmd => interaction.customId.startsWith(cmd.name))
                bt?.button(interaction as ButtonInteraction<'cached'>)
                executeRouteCommand(
                    interaction,
                    this.routes.interactions,
                    ...interaction.customId.split(this.interactionSplit)
                )
            }

            if (interaction.isSelectMenu()) {
                const mn = this.commands.find(cmd => interaction.customId.startsWith(cmd.name))
                mn?.select(interaction as SelectMenuInteraction<'cached'>)
                executeRouteCommand(
                    interaction,
                    this.routes.interactions,
                    ...interaction.customId.split(this.interactionSplit)
                )
            }

            if (interaction.type === InteractionType.ModalSubmit) {
                const md = this.commands.find(cmd => interaction.customId.startsWith(cmd.name))
                md?.modal(interaction as ModalSubmitInteraction<'cached'>)
                executeRouteCommand(
                    interaction,
                    this.routes.interactions,
                    ...interaction.customId.split(this.interactionSplit)
                )
            }

            if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
                const au = this.commands.get(interaction.commandName)
                au?.autocomplete(interaction as AutocompleteInteraction<'cached'>)
                const names: string[] = getFullCommandName(interaction).filter(Boolean)
                executeRouteCommand(
                    interaction,
                    this.routes.interactions,
                    ...names,
                    interaction.options.getFocused(true).name
                )
            }

            if (interaction.isMessageContextMenuCommand()) {
                executeRouteCommand(interaction, this.routes.interactions, interaction.commandName)
            }
        })

        console.log('\x1b[31m%s\x1b[0m', `${this.user?.username} ${this.version} ready!!!`)
    }

    async initializeEventListener(path: string) {
        try {
            const r = await Promise.all(
                readdirSync(path, { withFileTypes: true }).map(async file => {
                    if (file.isDirectory()) {
                        readdirSync(join(path, file.name))
                            .filter(f => f.endsWith('.event.js'))
                            .forEach(async f_1 => {
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
        processRoutesFileNames(path, ...args).map(i =>
            import(i)
                .then(f => {
                    if (interaction.isChatInputCommand()) f.chatInputCommandInteraction?.(interaction)
                    else if (interaction.isButton()) f.buttonInteraction?.(interaction, ...args)
                    else if (interaction.isSelectMenu()) f.selectMenuInteraction?.(interaction, ...args)
                    else if (interaction.type === InteractionType.ModalSubmit)
                        f.modalSubmitInteraction?.(interaction, ...args)
                    else if (interaction.type === InteractionType.ApplicationCommandAutocomplete)
                        f.autocompleteInteraction?.(interaction)
                    else if (interaction.isMessageContextMenuCommand())
                        f.messageContextMenuCommandInteraction?.(interaction)
                    f.default?.(interaction)
                })
                .catch(e => {
                    if (!e.message.startsWith('Cannot find module')) throw e
                })
        )
    } catch (error) {
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
