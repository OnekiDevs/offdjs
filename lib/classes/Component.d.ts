import { ButtonInteraction, ModalSubmitInteraction, SelectMenuInteraction } from 'discord.js';
export default class Component {
    regexp: RegExp;
    constructor(regexp: RegExp);
    button(interaction: ButtonInteraction): Promise<void>;
    select(interaction: SelectMenuInteraction): Promise<void>;
    modal(interaction: ModalSubmitInteraction): Promise<void>;
}
