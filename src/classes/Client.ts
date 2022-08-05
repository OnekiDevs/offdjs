import { Client as BaseClient } from 'discord.js'
import { createRequire } from 'module'
import {
    CommandManager,
    ClientOptions,
    ClientConstants,
    ComponentManager,
    OldCommandManager
} from '../utils/classes.js'
import i18n from 'i18n'
import { join } from 'path'
import { readdirSync } from 'fs'

const version = createRequire(import.meta.url)('../../package.json').version

export class Client extends BaseClient<true> {
    version: string
    i18n = i18n
    commands: CommandManager
    oldCommands: OldCommandManager
    components: ComponentManager
    constants: ClientConstants

    constructor(options: ClientOptions) {
        super(options)

        this.oldCommands = new OldCommandManager(this, options.routes.oldCommands)
        this.commands = new CommandManager(this, options.routes.commands)
        this.components = new ComponentManager(this, options.routes.components)

        this.i18n.configure(options.i18n)
        this.version = version ?? '1.0.0'

        this.constants = /* options.constants ?? */ {
            errorChannel: '',
            imgChannel: '',
            jsDiscordRoll: '',
            newServerLogChannel: ''
        }

        this.initializeEventListener(options.routes.events).then(() => {
            console.log('\x1b[35m%s\x1b[0m', 'Eventos Cargados!!')
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
        console.log('\x1b[32m%s\x1b[0m', 'Comandos Desplegados!!')

        console.log('\x1b[31m%s\x1b[0m', `${this.user?.username} ${this.version} Lista y Atenta!!!`)
    }

    initializeEventListener(path: string) {
        return Promise.all(
            readdirSync(path)
                .filter((f) => f.includes('.event.'))
                .map(async (file) => {
                    const event = await import('file://' + join(path, file))
                    const [eventName] = file.split('.')
                    this.on(eventName as string, (...args) => event.default(...args))
                })
        )
    }
}
