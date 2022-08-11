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
import ComponentManager from '../handlers/ComponentManager.js'
import i18n, { ConfigurationOptions } from 'i18n'
import { join } from 'path'
import { readdirSync } from 'fs'

const version = createRequire(import.meta.url)('../../package.json').version

export interface ClientOptions extends BaseClientOptions {
    // constants: ClientConstants
    routes: {
        commands: string
        events: string
        components: string
    }
    i18n: ConfigurationOptions
}

export default class Client extends BaseClient<true> {
    version: string
    i18n = i18n
    commands: CommandManager
    components: ComponentManager

    constructor(options: ClientOptions) {
        super(options)

        this.commands = new CommandManager(options.routes.commands)
        this.components = new ComponentManager(options.routes.components)

        this.i18n.configure(options.i18n)
        this.version = version ?? '1.0.0'

        this.initializeEventListener(options.routes.events).then((c) => {
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
            if (interaction.isChatInputCommand())
                this.commands
                    .get(interaction.commandName)
                    ?.interaction(interaction as ChatInputCommandInteraction<'cached'>)

            if (interaction.isButton()) {
                this.commands
                    .find((cmd) => interaction.customId.startsWith(cmd.name))
                    ?.button(interaction as ButtonInteraction<'cached'>)
                this.components
                    .find((btn) => btn.regexp.test(interaction.customId))
                    ?.button(interaction as ButtonInteraction<'cached'>)
            }

            if (interaction.type === InteractionType.ModalSubmit) {
                this.commands
                    .find((cmd) => interaction.customId.startsWith(cmd.name))
                    ?.modal(interaction as ModalSubmitInteraction<'cached'>)
                this.components
                    .find((btn) => btn.regexp.test(interaction.customId))
                    ?.modal(interaction as ModalSubmitInteraction<'cached'>)
            }

            if (interaction.type === InteractionType.ApplicationCommandAutocomplete)
                this.commands
                    .get(interaction.commandName)
                    ?.autocomplete(interaction as AutocompleteInteraction<'cached'>)

            if (interaction.isSelectMenu()) {
                this.commands
                    .find((cmd) => interaction.customId.startsWith(cmd.name))
                    ?.select(interaction as SelectMenuInteraction<'cached'>)
                this.components
                    .find((btn) => btn.regexp.test(interaction.customId))
                    ?.select(interaction as SelectMenuInteraction<'cached'>)
            }
        })

        console.log('\x1b[31m%s\x1b[0m', `${this.user?.username} ${this.version} ready!!!`)
    }

    initializeEventListener(path: string) {
        try {
            return Promise.all(
                readdirSync(path, { withFileTypes: true }).map(async (file) => {
                    if (file.isDirectory()) {
                        readdirSync(join(path, file.name))
                            .filter((f) => f.endsWith('.event.js'))
                            .forEach(async (f) => {
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
            ).then((r) => r.length)
        } catch (error) {
            return Promise.resolve()
        }
    }
}
