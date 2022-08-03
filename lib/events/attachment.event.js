import { checkSend, sendError, Translator } from '../utils/utils.js';
import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
export default async function (message) {
    try {
        const client = message.client;
        const server = client.getServer(message.guild);
        const translate = Translator(message);
        if (server.disabledChannels.includes(message.channelId))
            return;
        if (!server.logsChannels.attachment)
            return;
        if (message.author.bot)
            return;
        const channel = client.channels.cache.get(server.logsChannels.attachment);
        if (!channel || !checkSend(channel, message.guild.members.me))
            return;
        channel.send({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                    name: translate('attachment_event', { user: message.member?.displayName }),
                    url: message.url
                })
                    .addFields({
                    name: translate('channel'),
                    value: `<#${message.channelId}> | ${message.channel.name}`
                })
                    .setThumbnail(message.author.displayAvatarURL())
            ],
            files: message.attachments.map(a => new AttachmentBuilder(a.url)),
            content: message.content
                .match(/\.(jpeg|jpg|gif|png|webp|mp4|webm|mp3|ogg|wav|flac|aac|m4a|opus|midi|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md|rtf|csv|tsv|xml|json|js|css|html|htm|svg|woff2|apng|bmp|tiff|cur|eot|ttf|ico|otf)$/)
                ?.join('\n') || null
        });
    }
    catch (error) {
        sendError(error, import.meta.url);
    }
}
