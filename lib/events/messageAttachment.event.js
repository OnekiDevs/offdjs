import { EmbedBuilder } from 'discord.js';
import { checkSend, sendError } from '../utils/utils.js';
export default async function (msg) {
    try {
        if (!msg.guild)
            return;
        if (!msg.client.servers.has(msg.guild?.id ?? ''))
            return;
        const server = msg.client.getServer(msg.guild);
        if (!server?.logsChannels.attachment)
            return;
        if (msg.channel.id === server.logsChannels.attachment)
            return;
        const channel = msg.client.channels.cache.get(server.logsChannels.attachment);
        if (channel && checkSend(channel, msg.guild?.members.me)) {
            channel.send({
                files: msg.attachments.map(attachment => attachment),
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`attachments sent by ${msg.member?.displayName}`)
                        .setThumbnail(msg.member?.displayAvatarURL())
                        .addFields({
                        name: 'Canal',
                        value: '```' + `${msg.channel} | ${msg.channel.name}` + '```'
                    })
                        .setURL(msg.url)
                ],
                content: msg.author.id
            });
        }
        else {
            if (msg.guild?.publicUpdatesChannel &&
                checkSend(msg.guild?.publicUpdatesChannel, msg.guild.members.me))
                msg.guild?.publicUpdatesChannel.send({
                    content: `El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de Attachments, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_attachment** nuevamente`
                });
            else {
                const channel = msg.guild.channels.cache.find(c => c.isTextBased() && checkSend(c, msg.guild?.members.me));
                if (channel)
                    channel.send(`El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de attachments, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_attachment** nuevamente`);
            }
            server.removeMessageDeleteLog();
        }
    }
    catch (error) {
        sendError(error, import.meta.url);
    }
}
