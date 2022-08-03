import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    InteractionType,
    ModalSubmitInteraction,
    Interaction,
    AutocompleteInteraction,
    SelectMenuInteraction
} from 'discord.js'
import client from '../index.js'
import { sendError } from '../utils/utils.js'

export default async function (interaction: Interaction) {
    try {
        if (interaction.isChatInputCommand())
            client.commands
                .get(interaction.commandName)
                ?.interaction(
                    interaction as ChatInputCommandInteraction<'cached'>
                )

        if (interaction.isButton()) {
            client.components
                .find(btn => btn.regex.test(interaction.customId))
                ?.button(interaction)
            client.commands
                .find(cmd => interaction.customId.startsWith(cmd.name))
                ?.button(interaction as ButtonInteraction<'cached'>)
        }

        if (interaction.type === InteractionType.ModalSubmit)
            client.commands
                .find(cmd => interaction.customId.startsWith(cmd.name))
                ?.modal(interaction as ModalSubmitInteraction<'cached'>)

        if (interaction.type === InteractionType.ApplicationCommandAutocomplete)
            client.commands
                .get(interaction.commandName)
                ?.autocomplete(interaction as AutocompleteInteraction<'cached'>)

        if (interaction.isSelectMenu())
            client.commands
                .find(cmd => interaction.customId.startsWith(cmd.name))
                ?.select(interaction as SelectMenuInteraction<'cached'>)
    } catch (error) {
        sendError(error as Error, import.meta.url)
    }
}
