import { AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, Message, ModalSubmitInteraction, SelectMenuInteraction } from 'discord.js';
import { Command } from '../utils/classes.js';
export default class Test extends Command {
    constructor();
    interaction(interaction: ChatInputCommandInteraction<'cached'>): Promise<void>;
    message(message: Message<true>, _args: string[]): Promise<any>;
    button(interaction: ButtonInteraction<'cached'>): Promise<any>;
    autocomplete(interaction: AutocompleteInteraction<'cached'>): Promise<any>;
    modal(interaction: ModalSubmitInteraction<'cached'>): Promise<any>;
    select(interaction: SelectMenuInteraction<'cached'>): Promise<any>;
}
