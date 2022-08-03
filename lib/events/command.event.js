import { sendError } from '../utils/utils.js';
export default async function (msg, command, args = []) {
    try {
        const client = msg.client;
        if (msg.author.bot)
            return;
        client.oldCommands.getCommand(command)?.run(msg, args);
        client.commands.get(command)?.message(msg, args);
    }
    catch (error) {
        sendError(error, import.meta.url);
    }
}
