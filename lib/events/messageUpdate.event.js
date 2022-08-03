import { EmbedBuilder, resolveColor, escapeCodeBlock, codeBlock } from 'discord.js';
import { checkSend, sendError, Translator } from '../utils/utils.js';
export default async function (old, message) {
    try {
        if (message.author.bot)
            return;
        if (!message.guild)
            return;
        if (!message.client.servers.has(message.guild?.id ?? ''))
            return;
        const server = message.client.getServer(message.guild);
        const translate = Translator(message);
        if (!server?.logsChannels.messageUpdate)
            return;
        const channel = message.client.channels.cache.get(server.logsChannels.messageUpdate);
        if (channel && checkSend(channel, message.guild?.members.me)) {
            const embed = new EmbedBuilder()
                .setTitle(translate('message_update_event.edited'))
                .setURL(message.url)
                .setColor(resolveColor('Random'))
                .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL()
            })
                .addFields({
                name: translate('message_update_event.in'),
                value: String(message.channel),
                inline: true
            }, {
                name: translate('message_update_event.edited_on'),
                value: `<t:${Math.round(Date.now() / 1000)}>`,
                inline: true
            }, {
                name: translate('message_update_event.written_on'),
                value: `<t:${Math.round(old.createdTimestamp / 1000)}>`,
                inline: true
            })
                .setTimestamp()
                .setThumbnail(message.author.displayAvatarURL({}));
            if (old.content)
                embed.addFields({
                    name: translate('before') + ':',
                    value: codeBlock(escapeCodeBlock(old.content).length > 1024
                        ? escapeCodeBlock(old.content).substring(0, 1013) + '...'
                        : escapeCodeBlock(old.content))
                });
            if (message.content)
                embed.addFields({
                    name: translate('after') + ':',
                    value: codeBlock(escapeCodeBlock(message.content).length > 1024
                        ? escapeCodeBlock(message.content).substring(0, 1013) + '...'
                        : escapeCodeBlock(message.content))
                });
            embed.setFooter(message.client.embedFooter);
            if (message.reference) {
                try {
                    const reference = await message.fetchReference();
                    if (reference.content)
                        embed.addFields({
                            name: translate('message_update_event.reference'),
                            value: reference.member?.displayName +
                                ': \n' +
                                codeBlock(escapeCodeBlock(reference.content).length > 1024
                                    ? escapeCodeBlock(reference.content).substring(0, 1010 - reference.member?.displayName.length) + '...'
                                    : escapeCodeBlock(reference.content))
                        });
                }
                catch { }
            }
            channel.send({ embeds: [embed], content: message.author.id });
        }
        else {
            if (message.guild?.publicUpdatesChannel &&
                checkSend(message.guild?.publicUpdatesChannel, message.guild.members.me))
                message.guild?.publicUpdatesChannel.send({
                    content: `El canal <#${server.logsChannels.messageUpdate}> esta configurado para mostrar logs de mensajes editados, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_update** nuevamente`
                });
            else {
                const channel = message.guild.channels.cache.find(c => c.isTextBased() && checkSend(c, message.guild?.members.me));
                if (channel)
                    channel.send(`El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de mensajes editados, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_update** nuevamente`);
            }
            server.removeMessageUpdateLog();
        }
    }
    catch (error) {
        sendError(error, import.meta.url);
    }
}
