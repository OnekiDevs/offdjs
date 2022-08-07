export default class Component {
    regexp;
    constructor(regexp) {
        this.regexp = regexp;
    }
    async button(interaction) {
        interaction.customId;
    }
    async select(interaction) {
        interaction.customId;
    }
    async modal(interaction) {
        interaction.deferReply();
    }
}
