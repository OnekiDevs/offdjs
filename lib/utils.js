import { PermissionsBitField, BaseInteraction } from 'discord.js';
import client from './index.js';
export function sleep(ms = 1000) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export function capitalize(input) {
    return input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
}
export function checkSend(channel, member) {
    return channel
        .permissionsFor(member)
        .has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel], true);
}
export function filledBar(current, length = 25, barrChar = '█') {
    const progress = Math.round(length * (current / 100));
    const emptyProgress = length - progress;
    return barrChar.repeat(progress) + ' '.repeat(emptyProgress);
}
export function randomId() {
    return Math.random().toString().slice(-8);
}
export const Translator = function (interaction) {
    let lang = interaction instanceof BaseInteraction ? interaction.locale : interaction.guild.preferredLocale;
    const i18n = client.i18n;
    return (phrase, params) => {
        return i18n.__mf({ phrase, locale: lang }, params);
    };
};
