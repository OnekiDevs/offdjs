import { PermissionsBitField } from 'discord.js';
import { sendError } from '../utils/utils.js';
export default async function (msg) {
    const client = msg.client;
    const server = client.getServer(msg.guild);
    if (server.disabledChannels.includes(msg.channelId))
        return;
    try {
        if (msg.attachments.size > 0 ||
            (msg.content.match(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/) &&
                msg.content.match(/\.(jpeg|jpg|gif|png|webp|mp4|webm|mp3|ogg|wav|flac|aac|m4a|opus|midi|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md|rtf|csv|tsv|xml|json|js|css|html|htm|svg|woff2|apng|bmp|tiff|cur|eot|ttf|ico|otf)$/)))
            msg.client.emit('attachment', msg);
        const cs = server.suggestChannels.find(c => c.channel === msg.channelId);
        if (cs && !msg.author.bot) {
            const channel = client.channels.cache.get(cs.channel);
            if (channel) {
                server.sendSuggestion(msg);
                return msg.delete();
            }
        }
        const prefix = server?.prefixes.find(p => msg.content.startsWith(p));
        if (!prefix)
            return;
        const args = msg.content.slice(prefix?.length).split(/ /gi);
        msg.client.emit('command', msg, args.shift(), args);
    }
    catch (error) {
        sendError(error, import.meta.url);
    }
    if (msg.member?.permissions.has(PermissionsBitField.Flags.Administrator))
        return;
    if (server.blacklistedWords.includes(msg.content.toLowerCase()))
        return msg.delete().catch(() => '');
    return;
}
