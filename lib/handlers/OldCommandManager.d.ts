import { Collection } from 'discord.js';
import { OldCommand, Client } from '../utils/classes.js';
export declare class OldCommandManager extends Collection<string, OldCommand> {
    constructor(client: Client, path: string);
    getCommand(name: string): OldCommand | undefined;
}
