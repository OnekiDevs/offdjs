import {
    ApplicationCommandDataResolvable,
    ChatInputCommandInteraction,
    IntentsBitField,
    ClientOptions,
    Client,
    Events,
} from 'discord.js'
import { formatName, registerEvents, InteractionFile } from './utils.js'
import autocompleteCache from './cache/autocompletes.js'
import commandsCache from './cache/commands.js'
import contextCache from './cache/contexts.js'
import buttonsCache from './cache/buttons.js'
import modalsCache from './cache/modals.js'
import menusCache from './cache/menus.js'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import 'dotenv/config'

export class OFFDJSClient<T extends boolean> extends Client<T> {
    declare options: Omit<ClientOptions, 'intents'> & { intents: IntentsBitField; root: string }

    constructor(options: ClientOptions & { root?: string }) {
        super(options)
        this.options.root = options.root ?? '.'
    }

    override async login(token?: string): Promise<string> {
        await autocompleteCache.register(join(process.cwd(), this.options.root, 'autocompletes'), true)
        await commandsCache.register(join(process.cwd(), this.options.root, 'commands'), true)
        await contextCache.register(join(process.cwd(), this.options.root, 'contexts'), true)
        await buttonsCache.register(join(process.cwd(), this.options.root, 'buttons'), true)
        await modalsCache.register(join(process.cwd(), this.options.root, 'modals'), true)
        await menusCache.register(join(process.cwd(), this.options.root, 'menus'), true)
        await registerEvents(join(process.cwd(), this.options.root, 'events'), this)
        const t = await super.login(token)
        try {
            const commandsData: ApplicationCommandDataResolvable[] = []
            for (const file of readdirSync(join(process.cwd(), this.options.root, 'commands'))) {
                const cmd = (await import(join(process.cwd(), this.options.root, 'commands', file))) as { command: ApplicationCommandDataResolvable }
                if (cmd.command) commandsData.push(cmd.command)
            }
            for (const guild of this.guilds.cache.values()) await guild.commands.set(commandsData)
        }
        catch (e) {
            if (!(e as Error).message.includes('no such file or directory'))
                throw e
        }
        this.on(Events.InteractionCreate, interaction => {
            if (interaction.isChatInputCommand())
                return commandsCache
                    .fetch(formatName(interaction))
                    .forEach(h => h(interaction, ...formatName(interaction).split(':')))
            if (interaction.isButton())
                return buttonsCache.fetch(interaction.customId).forEach(h => h(interaction, ...interaction.customId.split(':')))
            if (interaction.isModalSubmit())
                return modalsCache.fetch(interaction.customId).forEach(h => h(interaction, ...interaction.customId.split(':')))
            if (interaction.isAnySelectMenu())
                return menusCache.fetch(interaction.customId).forEach(h => h(interaction, ...interaction.customId.split(':')))
            if (interaction.isContextMenuCommand())
                return contextCache.fetch(interaction.commandName).forEach(h => h(interaction))
            if (interaction.isAutocomplete())
                return autocompleteCache
                    .fetch(formatName(interaction))
                    .forEach(h => h(interaction, ...formatName(interaction).split(':')))
        })
        return t
    }
}

const client = new OFFDJSClient({
    intents: IntentsBitField.Flags.Guilds | IntentsBitField.Flags.GuildMembers,
})

export default client as OFFDJSClient<true>
export { client }
