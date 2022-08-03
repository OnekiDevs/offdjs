import { Server } from '../utils/classes.js';
import { Collection } from 'discord.js';
export class ServerManager extends Collection {
    client;
    constructor(client) {
        super();
        this.client = client;
    }
    initialize() {
        return Promise.all(this.client.guilds?.cache.map(async (guild) => {
            const server = new Server(guild);
            await server.init();
            return this.set(guild.id, server);
        }));
    }
}
