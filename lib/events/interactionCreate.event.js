import { InteractionType } from 'discord.js';
import client from '../index.js';
import { sendError } from '../utils/utils.js';
export default async function (interaction) {
    try {
        if (interaction.isChatInputCommand())
            client.commands
                .get(interaction.commandName)
                ?.interaction(interaction);
        if (interaction.isButton()) {
            client.components
                .find(btn => btn.regex.test(interaction.customId))
                ?.button(interaction);
            client.commands
                .find(cmd => interaction.customId.startsWith(cmd.name))
                ?.button(interaction);
        }
        if (interaction.type === InteractionType.ModalSubmit)
            client.commands
                .find(cmd => interaction.customId.startsWith(cmd.name))
                ?.modal(interaction);
        if (interaction.type === InteractionType.ApplicationCommandAutocomplete)
            client.commands
                .get(interaction.commandName)
                ?.autocomplete(interaction);
        if (interaction.isSelectMenu())
            client.commands
                .find(cmd => interaction.customId.startsWith(cmd.name))
                ?.select(interaction);
    }
    catch (error) {
        sendError(error, import.meta.url);
    }
}
