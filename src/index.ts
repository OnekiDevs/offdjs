import {
    ApplicationCommandDataResolvable,
    ChatInputCommandInteraction,
    Client,
    Events,
    IntentsBitField,
} from 'discord.js'
import autocompleteCache from './cache/autocompletes.js'
import { formatName, registerEvents } from './utils.js'
import commandsCache from './cache/commands.js'
import contextCache from './cache/contexts.js'
import buttonsCache from './cache/buttons.js'
import { InteractionFile } from './types.js'
import modalsCache from './cache/modals.js'
import menusCache from './cache/menus.js'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import 'dotenv/config'

const client = new Client({
    intents: IntentsBitField.Flags.Guilds | IntentsBitField.Flags.GuildMembers,
})

await registerEvents(join(process.cwd(), 'events'), client)

client.on(Events.ClientReady, async client => {
    const commandsData: ApplicationCommandDataResolvable[] = []
    for (const file of readdirSync(join(process.cwd(), 'commands'))) {
        const cmd = (await import(
            join(process.cwd(), 'commands', file)
        )) as InteractionFile<ChatInputCommandInteraction>
        if (cmd.command) commandsData.push(cmd.command)
    }

    client.guilds.cache.forEach(guild => guild.commands.set(commandsData))
})

client.on(Events.InteractionCreate, interaction => {
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

client.login()
