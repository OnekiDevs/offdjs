import { EmbedBuilder, resolveColor } from 'discord.js';
import { Server } from '../utils/classes.js';
import { checkSend, sendError } from '../utils/utils.js';
export default async function (guild) {
    try {
        if (!guild.client.servers.has(guild.id))
            guild.client.servers.set(guild.id, new Server(guild));
        console.log('\x1b[34m%s\x1b[0m', `Nuevo Servidor Desplegado!! ${guild.name} (${guild.id})`);
        guild.client.commands
            .deploy(guild)
            .then(() => console.log('\x1b[32m%s\x1b[0m', 'Comandos Desplegados para ' + guild.name));
        const channel = guild.client.channels.cache.get(guild.client.constants.newServerLogChannel ?? '');
        if (channel && checkSend(channel, guild.members.me)) {
            const [u, b] = guild.members.cache.partition(m => !m.user.bot);
            const owner = await guild.client.users.fetch(guild.ownerId);
            const embed = new EmbedBuilder()
                .setThumbnail(guild.iconURL() ?? '')
                .setTitle('Me añadieron en un Nuevo Servidor')
                .setDescription(`ahora estoy en ${guild.client.guilds.cache.size} servidores`)
                .addFields({
                name: 'Servidor',
                value: '```' + guild.name + '```',
                inline: true
            }, {
                name: 'ID',
                value: '```' + guild.id + '```',
                inline: true
            }, {
                name: 'Roles',
                value: '```' + String(guild.roles.cache.size) + '```',
                inline: true
            }, {
                name: 'Miembros',
                value: '```' + `Users: ${u.size}\nBots: ${b.size}` + '```',
                inline: true
            }, {
                name: 'Dueño',
                value: '```' + `${owner.tag}\n${owner.id}` + '```',
                inline: true
            })
                .setTimestamp()
                .setColor(resolveColor('Random'))
                .setFooter(guild.client.embedFooter)
                .setImage(guild.bannerURL() ?? '');
            channel.send({
                embeds: [embed]
            });
        }
    }
    catch (error) {
        sendError(error, import.meta.url);
    }
}
