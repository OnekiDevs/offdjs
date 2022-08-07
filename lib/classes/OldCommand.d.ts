import { Message } from 'discord.js';
export default class OldCommand {
    name: string;
    alias: string[];
    constructor(options: {
        name: string;
        description: string;
        alias?: string[];
    });
    run(msg: Message<true>, args: string[]): void;
}
