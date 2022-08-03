import client from '../index.js';
export default async function (member) {
    const server = client.getServer(member.guild);
    if (!server.keepRoles || !server.premium)
        return;
    const userSnap = (await server.db.collection('users').doc(member.id).get()).data();
    if (!userSnap)
        return;
    const roles = userSnap.roles;
    roles.map(role => {
        member.roles.add(role).catch(async () => {
            if (!server?.logsChannels.memberUpdate)
                return;
            const userUpdateChannel = (await server.guild.channels.fetch(server.logsChannels.memberUpdate));
            if (!userUpdateChannel)
                return;
            userUpdateChannel.send({
                content: `⚠️ Intenté añadirle el rol ${await server.guild.roles.fetch(role)} al usuario ${member}, sin embargo, no tengo permisos para ello o mi rol está por debajo del suyo ⚠️`,
                allowedMentions: { roles: [] }
            });
        });
    });
}
