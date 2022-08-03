import { Collection, Guild } from 'discord.js';
import { Command, Client } from '../utils/classes.js';
export declare class CommandManager extends Collection<string, Command> {
    client: Client;
    constructor(client: Client, path: string);
    deploy(guild?: Guild): Promise<void> | Promise<(void | import("discord.js").ApplicationCommand<{
        guild: import("discord.js").GuildResolvable;
    }> | (void | import("discord.js").ApplicationCommand<{}>)[])[]>;
}
