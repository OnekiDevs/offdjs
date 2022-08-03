import { EmbedBuilder, resolveColor, escapeCodeBlock, codeBlock } from 'discord.js';
import { sendError, checkSend, PunishmentType, Translator } from '../utils/utils.js';
export default async function (message) {
    try {
        if (!message.client.servers.has(message.guild.id))
            return;
        const server = message.client.getServer(message.guild);
        if (message.author.bot)
            return;
        if (!message.guild)
            return;
        const translate = Translator(message);
        await checkGhostPing(server, message);
        if (!server.logsChannels.messageDelete)
            return;
        const channel = message.client.channels.cache.get(server.logsChannels.messageDelete);
        if (channel && checkSend(channel, message.guild.members.me)) {
            const embed = new EmbedBuilder()
                .setTitle(translate('message_delete_event.deleted'))
                .setURL(message.url)
                .setColor(resolveColor('Random'))
                .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL()
            })
                .setTimestamp()
                .setThumbnail(message.author.displayAvatarURL())
                .addFields({
                name: translate('message_delete_event.in'),
                value: String(message.channel),
                inline: true
            }, {
                name: translate('message_delete_event.on'),
                value: `<t:${Math.round(Date.now() / 1000)}>`,
                inline: true
            })
                .setFooter(message.client.embedFooter);
            if (message.content)
                embed.setDescription(codeBlock(escapeCodeBlock(message.content).length > 1024
                    ? escapeCodeBlock(message.content).substring(0, 1015) + '...'
                    : escapeCodeBlock(message.content)));
            if (message.reference) {
                try {
                    const reference = (await message.fetchReference());
                    if (reference.content)
                        embed.addFields({
                            name: translate('message_delete_event.reference'),
                            value: reference.member?.displayName +
                                ': \n' +
                                codeBlock(escapeCodeBlock(reference.content).length > 1024
                                    ? escapeCodeBlock(reference.content).substring(0, 1013 - reference.member?.displayName.length) + '...'
                                    : escapeCodeBlock(reference.content))
                        });
                }
                catch { }
            }
            channel.send({ embeds: [embed], content: message.author.id });
        }
        else {
            if (message.guild.publicUpdatesChannel &&
                checkSend(message.guild.publicUpdatesChannel, message.guild.members.me))
                message.guild.publicUpdatesChannel.send(`El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de mensajes eliminados, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_delete** nuevamente`);
            else {
                const channel = message.guild.channels.cache.find(c => c.isTextBased() && checkSend(c, message.guild?.members.me));
                if (channel)
                    channel.send(`El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de mensajes eliminados, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_delete** nuevamente`);
            }
            server.removeMessageDeleteLog();
        }
    }
    catch (error) {
        sendError(error, import.meta.url);
    }
}
async function checkGhostPing(server, msg) {
    const translate = Translator(msg);
    const regex = /<@!?\d{18}>/;
    if (!regex.test(msg.content))
        return;
    const user = msg.mentions.users.first();
    if (!user || user === msg.author || user?.bot)
        return;
    const timeBeforeDeletion = new Date().getTime() - msg.createdTimestamp;
    const timeBeforeDeletioninSecs = timeBeforeDeletion / 1000;
    if (timeBeforeDeletioninSecs > 7)
        return;
    const channel = (await msg.client.channels.fetch('885674115615301650'));
    channel.send({
        content: translate('ghost_ping_event.realized', {
            ghostingUser: msg.member?.toString(),
            ghostedUser: user?.toString()
        }),
        allowedMentions: { users: [] }
    });
    const ghosterSnap = (await server.db.collection('users').doc(msg.author.id).get()).data();
    if (!ghosterSnap)
        return warnUser(server, channel, msg, user);
    const ghostSanctions = ghosterSnap.sanctions?.filter((sanction) => sanction.reason === 'Ghost pinging');
    if (!ghostSanctions?.length)
        return warnUser(server, channel, msg, user);
    server
        .punishUser({
        userId: msg.author.id,
        type: PunishmentType.MUTE,
        reason: 'Ghost pinging',
        duration: '10m',
        moderatorId: msg.client.user.id
    })
        .then(() => {
        channel.send({
            content: translate('ghost_ping_event.muted', {
                ghostingUser: msg.member?.toString(),
                ghostedUser: user?.toString()
            }),
            allowedMentions: { users: [] }
        });
    })
        .catch(() => {
        channel.send({
            content: translate('ghost_ping_event.cant_mute', {
                ghostingUser: msg.member?.toString(),
                ghostedUser: user?.toString()
            }),
            allowedMentions: { users: [] }
        });
    });
}
function warnUser(server, channel, msg, user) {
    const translate = Translator(msg);
    server
        .punishUser({
        userId: msg.author.id,
        type: PunishmentType.WARN,
        reason: 'Ghost pinging',
        moderatorId: msg.client.user.id
    })
        .then(() => {
        channel.send({
            content: translate('ghost_ping_event.warned', {
                ghostingUser: msg.member?.toString(),
                ghostedUser: user?.toString()
            }),
            allowedMentions: { users: [] }
        });
    })
        .catch(() => {
        channel.send({
            content: translate('ghost_ping_event.cant_warn', {
                ghostingUser: msg.member?.toString(),
                ghostedUser: user?.toString()
            }),
            allowedMentions: { users: [] }
        });
    });
}
