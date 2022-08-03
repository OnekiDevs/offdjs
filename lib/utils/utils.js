import { fileURLToPath } from 'url';
import { PermissionsBitField, AttachmentBuilder, EmbedBuilder, Utils, Colors, ActionRowBuilder, TextInputStyle, BaseInteraction } from 'discord.js';
import client from '../index.js';
export { Utils };
export function sleep(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function capitalize(input) {
    return (input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase());
}
export function permissionsError(interaction, permissions) {
    interaction.reply({
        content: `No tienes los permissions suficientes, necesitas \`${new PermissionsBitField(permissions)
            .toArray()
            .join(', ')}\``,
        ephemeral: true
    });
}
export function checkSend(channel, member) {
    return channel
        .permissionsFor(member)
        .has([
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ViewChannel
    ]);
}
export function filledBar(current, length = 25) {
    const progress = Math.round(length * (current / 100));
    const emptyProgress = length - progress;
    const progressText = '█'.repeat(progress);
    const emptyProgressText = ' '.repeat(emptyProgress);
    return progressText + emptyProgressText;
}
export const pollEmojis = [
    '🇦',
    '🇧',
    '🇨',
    '🇩',
    '🇪',
    '🇫',
    '🇬',
    '🇭',
    '🇮',
    '🇯',
    '🇰',
    '🇱',
    '🇲',
    '🇳',
    '🇴',
    '🇵',
    '🇶',
    '🇷',
    '🇸',
    '🇹'
];
export function randomId() {
    return Math.random().toString().slice(-8);
}
export function imgToLink(img, client) {
    return new Promise((resolve, reject) => {
        const channel = client.channels.cache.get(client.constants.imgChannel);
        if (channel)
            channel
                .send({
                files: [new AttachmentBuilder(img)]
            })
                .then(msg => {
                resolve(msg.attachments.first()?.url ?? '');
            })
                .catch(() => {
                reject('No message');
            });
        else
            reject('No channel');
    });
}
export async function sendError(error, file) {
    console.log('\x1b[31m***************************************************************************\x1b[0m\n', error, '\n\x1b[31m***************************************************************************\x1b[0m');
    const channel = await client.channels.fetch(client.constants.errorChannel);
    if (channel)
        channel.send({
            content: process.env.NODE_ENV !== 'production'
                ? process.env.DEVELOPER_ID
                    ? `<@${process.env.DEVELOPER_ID}>`
                    : null
                : `<@&${client.constants.jsDiscordRoll}>`,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle('New Error Detected')
                    .addFields([
                    {
                        name: 'Error Type',
                        value: '```' + `\n${error.name}\n` + '```',
                        inline: true
                    },
                    {
                        name: 'Error Message',
                        value: '```' + `\n${error.message}\n` + '```',
                        inline: true
                    },
                    {
                        name: 'Error In',
                        value: '```' + `\n${fileURLToPath(file)}\n` + '```',
                        inline: true
                    }
                ]),
                new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle('Error Stack')
                    .setDescription('```' + `\n${error.stack}\n` + '```')
            ]
        });
}
export const Translator = function (interaction) {
    let lang = interaction instanceof BaseInteraction
        ? interaction.locale
        : interaction.guild.preferredLocale;
    const i18n = client.i18n;
    return (phrase, params) => {
        return i18n.__mf({ phrase, locale: lang }, params);
    };
};
export var PunishmentType;
(function (PunishmentType) {
    PunishmentType[PunishmentType["WARN"] = 0] = "WARN";
    PunishmentType[PunishmentType["KICK"] = 1] = "KICK";
    PunishmentType[PunishmentType["MUTE"] = 2] = "MUTE";
    PunishmentType[PunishmentType["BAN"] = 3] = "BAN";
    PunishmentType[PunishmentType["HACKBAN"] = 4] = "HACKBAN";
})(PunishmentType || (PunishmentType = {}));
export function createModalComponent(input) {
    if (!input.data.style)
        input.setStyle(TextInputStyle.Short);
    return new ActionRowBuilder().addComponents([input]);
}
