import { Message } from 'discord.js';
import { Client } from '../utils/classes.js';
export declare class OldCommand {
    name: string;
    description: string;
    alias: string[];
    client: Client;
    constructor(options: {
        name: string;
        description: string;
        alias?: string[];
        client: Client;
    });
    run(msg: Message<true>, args: string[]): void;
}
