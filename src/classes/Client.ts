import {
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Client as BaseClient,
    ClientOptions as BaseClientOptions,
    Interaction,
    InteractionType,
    ModalSubmitInteraction,
    SelectMenuInteraction,
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
}

export default class Client extends BaseClient<true> {
    version: string
    i18n = i18n
    commands: CommandManager
    routes = {
        interactions: process.cwd(),
    }

    constructor(options: ClientOptions) {
        super(options)

        this.commands = new CommandManager(options.routes.commands)

        this.i18n.configure(options.i18n)
        this.version = version ?? '1.0.0'

        this.routes.interactions = options.routes.interactions

        this.initializeEventListener(options.routes.events).then(c => {
            if (c) console.log('\x1b[35m%s\x1b[0m', 'Eventos Cargados!!')
        })

        this.once('ready', () => this._onReady())
    }

    get embedFooter() {
        return {
            text: `${this.user?.username} Bot v${this.version}`,
            iconURL: this.user?.avatarURL() as string,
        }
    }

    private async _onReady() {
        await this.commands.deploy()
        if (this.commands.size) console.log('\x1b[32m%s\x1b[0m', 'Comandos Desplegados!!')
        this.on('interactionCreate', (interaction: Interaction) => {
            // isChatInputCommand
            if (interaction.isChatInputCommand()) {
                const cm = this.commands.get(interaction.commandName)
                // cm?.interaction(interaction)
                cm?.chatInputCommandInteraction(
                    interaction as ChatInputCommandInteraction<'cached'>
                )

                try {
                    const subcommandGroupName = interaction.options.getSubcommandGroup()
                    const subcommandName = interaction.options.getSubcommand()
                    const commandName = interaction.commandName
                    // existen grupos
                    if (subcommandGroupName) {
                        // importar int/group/sub
                        import(
                            join(
                                this.routes.interactions,
                                commandName,
                                subcommandGroupName,
                                subcommandName + '.js'
                            )
                        )
                            .then(c => {
                                c.chatInputCommandInteraction?.(interaction)
                                // c.default?.(interaction)
                            })
                            .catch(e => null)
                        // importar int/group
                        import(
                            join(this.routes.interactions, commandName, subcommandGroupName + '.js')
                        )
                            .then(c => {
                                c.chatInputCommandInteraction?.(interaction)
                                c.default?.(interaction)
                            })
                            .catch(e => null)
                        // existen subcomandos
                    } else if (subcommandName) {
                        import(join(this.routes.interactions, commandName, subcommandName + '.js'))
                            .then(c => {
                                c.chatInputCommandInteraction?.(interaction)
                                // c.default?.(interaction)
                            })
                            .catch(e => null)
                    }
                    // importar int
                    import(join(this.routes.interactions, commandName + '.js'))
                        .then(c => {
                            c.chatInputCommandInteraction?.(interaction)
                            // c.default?.(interaction)
                        })
                        .catch(e => null)
                } catch (error) {}
            }

            if (interaction.isButton()) {
                const bt = this.commands.find(cmd => interaction.customId.startsWith(cmd.name))
                bt?.button(interaction as ButtonInteraction<'cached'>)
                // bt?.interaction(interaction)
            }

            if (interaction.type === InteractionType.ModalSubmit) {
                const md = this.commands.find(cmd => interaction.customId.startsWith(cmd.name))
                md?.modal(interaction as ModalSubmitInteraction<'cached'>)
                // md?.interaction(interaction)
            }

            if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
                const au = this.commands.get(interaction.commandName)
                au?.autocomplete(interaction as AutocompleteInteraction<'cached'>)
                // au?.interaction(interaction)
            }

            if (interaction.isSelectMenu()) {
                const mn = this.commands.find(cmd => interaction.customId.startsWith(cmd.name))
                mn?.select(interaction as SelectMenuInteraction<'cached'>)
                // mn?.interaction(interaction)
            }
        })

        console.log('\x1b[31m%s\x1b[0m', `${this.user?.username} ${this.version} ready!!!`)
    }

    initializeEventListener(path: string) {
        try {
            return Promise.all(
                readdirSync(path, { withFileTypes: true }).map(async file => {
                    if (file.isDirectory()) {
                        readdirSync(join(path, file.name))
                            .filter(f => f.endsWith('.event.js'))
                            .forEach(async f => {
                                const event = await import('file:///' + join(path, file.name, f))
                                const [eventName] = f.split('.')
                                this.on(eventName as string, (...args) => event.default(...args))
                            })
                    } else if (file.name.endsWith('.event.js')) {
                        const event = await import('file:///' + join(path, file.name))
                        const [eventName] = file.name.split('.')
                        this.on(eventName as string, (...args) => event.default(...args))
                    }
                })
            ).then(r => r.length)
        } catch (error) {
            return Promise.resolve()
        }
    }
}
