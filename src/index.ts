import {
    ApplicationCommandDataResolvable,
    IntentsBitField,
    ClientOptions,
    Client,
    Events,
} from 'discord.js'
import { formatName, registerEvents } from './utils.js'
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
    declare options: Omit<ClientOptions, 'intents'> & {
        intents: IntentsBitField
        root: string
    }

    constructor(options: ClientOptions & { root?: string }) {
        super(options)
        this.options.root = options.root ?? '.'
    }

    override async login(token?: string, verbose = false): Promise<string> {
        const a = await autocompleteCache.register(
            join(process.cwd(), this.options.root, 'autocompletes'),
            true,
        )
        if (a.size && verbose) console.log('Autocompletes registered:', a.size)
        const b = await commandsCache.register(
            join(process.cwd(), this.options.root, 'commands'),
            true,
        )
        if (b.size && verbose) console.log('Commands registered:', b.size)
        const c = await contextCache.register(
            join(process.cwd(), this.options.root, 'contexts'),
            true,
        )
        if (c.size && verbose) console.log('Contexts registered:', c.size)
        const d = await buttonsCache.register(
            join(process.cwd(), this.options.root, 'buttons'),
            true,
        )
        if (d.size && verbose) console.log('Buttons registered:', d.size)
        const e = await modalsCache.register(
            join(process.cwd(), this.options.root, 'modals'),
            true,
        )
        if (e.size && verbose) console.log('Modals registered:', e.size)
        const f = await menusCache.register(
            join(process.cwd(), this.options.root, 'menus'),
            true,
        )
        if (f.size && verbose) console.log('Menus registered:', f.size)
        const g = await registerEvents(
            join(process.cwd(), this.options.root, 'events'),
            this,
        )
        if (g && verbose) console.log('Events registered:', g)
        const t = await super.login(token)
        try {
            const globalCommandsData: ApplicationCommandDataResolvable[] = []
            const guildCommandsData: [
                string[],
                ApplicationCommandDataResolvable,
            ][] = []
            for (const file of readdirSync(
                join(process.cwd(), this.options.root, 'commands'),
            )) {
                const cmd = (await import(
                    join(process.cwd(), this.options.root, 'commands', file)
                )) as {
                    command: ApplicationCommandDataResolvable
                    guilds?: string[]
                }
                if (cmd.command && cmd.guilds)
                    guildCommandsData.push([cmd.guilds, cmd.command])
                else if (cmd.command) globalCommandsData.push(cmd.command)
            }
            for (const guild of this.guilds.cache.values()) {
                const toSend: ApplicationCommandDataResolvable[] = []
                for (const [guilds, command] of guildCommandsData)
                    if (!guilds.length || guilds.includes(guild.id))
                        toSend.push(command)
                await guild.commands.set(toSend)
            }
            await client.application?.commands.set(globalCommandsData)
        } catch (e) {
            if (!(e as Error).message.includes('no such file or directory'))
                throw e
        }
        this.on(Events.InteractionCreate, interaction => {
            if (interaction.isChatInputCommand())
                return commandsCache
                    .fetch(formatName(interaction))
                    .forEach(h =>
                        h(interaction, ...formatName(interaction).split(':')),
                    )
            if (interaction.isButton())
                return buttonsCache
                    .fetch(interaction.customId)
                    .forEach(h =>
                        h(interaction, ...interaction.customId.split(':')),
                    )
            if (interaction.isModalSubmit())
                return modalsCache
                    .fetch(interaction.customId)
                    .forEach(h =>
                        h(interaction, ...interaction.customId.split(':')),
                    )
            if (interaction.isAnySelectMenu())
                return menusCache
                    .fetch(interaction.customId)
                    .forEach(h =>
                        h(interaction, ...interaction.customId.split(':')),
                    )
            if (interaction.isContextMenuCommand())
                return contextCache
                    .fetch(interaction.commandName)
                    .forEach(h => h(interaction))
            if (interaction.isAutocomplete())
                return autocompleteCache
                    .fetch(formatName(interaction))
                    .forEach(h =>
                        h(interaction, ...formatName(interaction).split(':')),
                    )
        })
        return t
    }
}

const client = new OFFDJSClient({
    intents: IntentsBitField.Flags.Guilds | IntentsBitField.Flags.GuildMembers,
})

export default client as OFFDJSClient<true>
export { client }
