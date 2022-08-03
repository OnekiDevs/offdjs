import { Server, Client } from '../utils/classes.js';
import { Collection } from 'discord.js';
export declare class ServerManager extends Collection<string, Server> {
    client: Client;
    constructor(client: Client);
    initialize(): Promise<Awaited<this>[]>;
}
