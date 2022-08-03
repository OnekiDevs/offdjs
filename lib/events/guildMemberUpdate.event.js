import client from '../index.js';
export default async function (oldMember, newMember) {
    const server = client.getServer(newMember.guild);
    if (oldMember.nickname !== newMember.nickname)
        client.emit('customGuildMemberNickameUpdate', {
            server,
            oldMember,
            newMember
        });
    if (oldMember.avatar !== newMember.avatar)
        client.emit('customGuildMemberAvatarUpdate', {
            server,
            oldMember,
            newMember
        });
    if (oldMember.roles.cache.size !== newMember.roles.cache.size)
        client.emit('customGuildMemberRoleUpdate', {
            server,
            oldMember,
            newMember
        });
}
