import { Collection } from 'discord.js';
import OldCommand from '../classes/OldCommand.js';
export default class OldCommandManager extends Collection<string, OldCommand> {
    constructor(path: string);
    getCommand(name: string): OldCommand | undefined;
}
