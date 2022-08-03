export default async function ({ server, oldMember, newMember }) {
    if (!server.logsChannels.memberUpdate)
        return;
    const userActivitieChannel = await server.guild.channels.fetch(server.logsChannels.memberUpdate);
    if (!userActivitieChannel)
        return;
    userActivitieChannel.send(server.translate('useractivitie_event.nickname_change', { user: newMember.user.toString(), oldNickname: oldMember.nickname, newNickname: newMember.nickname }));
    if (!server.premium)
        return;
    const userSnap = (await server.db.collection('users').doc(newMember.id).get()).data();
    if (!userSnap)
        return;
    const userNicknamesList = userSnap.nicknames;
    const newNicknamesList = [...userNicknamesList, newMember.nickname];
    server.db.collection('users').doc(newMember.id).update({
        nicknames: newNicknamesList
    }).catch(() => server.db.collection('users').doc(newMember.id).set({
        nicknames: newNicknamesList
    }));
}
