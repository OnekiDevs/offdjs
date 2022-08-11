import { Collection, Guild } from 'discord.js';
import Command from '../classes/Command.js';
export default class CommandManager extends Collection<string, Command> {
    subcommands: Collection<string, Command>;
    constructor(path: string);
    deploy(guild?: Guild): Promise<void> | Promise<(void | import("discord.js").ApplicationCommand<{
        guild: import("discord.js").GuildResolvable;
    }> | (void | import("discord.js").ApplicationCommand<{}>)[])[]>;
}
