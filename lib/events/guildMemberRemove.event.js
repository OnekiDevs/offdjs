import client from '../index.js';
export default function (member) {
    if (member.user.bot)
        return;
    const server = client.getServer(member.guild);
    if (!server.keepRoles || !server.premium)
        return;
    const memberRoles = member.roles.cache.filter(role => !role.managed && role.id !== member.guild.id);
    const memberIdRoles = memberRoles.map(role => role.id);
    server.db.collection('users').doc(member.id).set({
        roles: memberIdRoles
    });
}
