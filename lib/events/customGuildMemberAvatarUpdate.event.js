import { EmbedBuilder, resolveColor } from 'discord.js';
import { checkSend } from '../utils/utils.js';
export default async function ({ server, oldMember, newMember }) {
    if (!server.logsChannels.memberUpdate)
        return;
    const userActivitieChannel = (await server.guild.channels.fetch(server.logsChannels.memberUpdate));
    if (!checkSend(userActivitieChannel, server.guild.members.me))
        return;
    const avatarEmbed = new EmbedBuilder()
        .setTitle(server.translate('useractivitie_event.serveravatar_change.title', { username: `${newMember.user.tag}` }))
        .setDescription(server.translate('useractivitie_event.serveravatar_change.description', { user: newMember.user.toString() }))
        .setImage(newMember.displayAvatarURL({ size: 4096 }))
        .setThumbnail(oldMember.displayAvatarURL())
        .setColor(resolveColor('Random'));
    userActivitieChannel.send({ embeds: [avatarEmbed] });
}
