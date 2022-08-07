import { ButtonInteraction, ModalSubmitInteraction, SelectMenuInteraction } from 'discord.js'

export default class Component {
    regexp: RegExp

    constructor(regexp: RegExp) {
        this.regexp = regexp
    }

    async button(interaction: ButtonInteraction) {
        interaction.customId
    }

    async select(interaction: SelectMenuInteraction) {
        interaction.customId
    }

    async modal(interaction: ModalSubmitInteraction) {
        interaction.deferReply()
    }
}
