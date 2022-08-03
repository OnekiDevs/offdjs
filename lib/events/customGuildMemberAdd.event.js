import client from '../index.js';
export default async function (member, type, invite) {
    const server = client.getServer(member.guild);
    if (!server.logsChannels.invite || !server.premium)
        return;
    const welcomeChannel = (await member.guild.channels.fetch(server.logsChannels.invite));
    if (type === 'normal')
        return welcomeChannel.send({
            content: server.translate('invites_event.default_message', {
                invited: member.toString(),
                inviter: invite.inviter?.toString()
            }),
            allowedMentions: { roles: [] }
        });
    if (type === 'vanity')
        return welcomeChannel.send({
            content: server.translate('invites_event.custom_url', {
                invited: member.toString()
            }),
            allowedMentions: { roles: [] }
        });
    if (type === 'permissions')
        return welcomeChannel.send({
            content: server.translate('invites_event.permissions_error', {
                invited: member.toString()
            }),
            allowedMentions: { roles: [] }
        });
    return welcomeChannel.send({
        content: server.translate('invites_event.cant_find_inviter', {
            invited: member.toString()
        }),
        allowedMentions: { roles: [] }
    });
}
