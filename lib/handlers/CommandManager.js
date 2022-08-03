import { readdirSync } from 'fs';
import { Collection } from 'discord.js';
import { join } from 'path';
export class CommandManager extends Collection {
    client;
    constructor(client, path) {
        super();
        this.client = client;
        try {
            for (const file of readdirSync(path).filter(f => f.endsWith('.command.js'))) {
                import('file:///' + join(path, file)).then(command => {
                    const cmd = new command.default(client);
                    this.set(cmd.name, cmd);
                });
            }
        }
        catch (error) {
            console.log('WARNING:', `${error}`);
        }
    }
    deploy(guild) {
        if (process.env.DEPLOY_COMMANDS == 'true')
            return Promise.all(this.map(command => command.deploy(guild)));
        else
            return Promise.resolve();
    }
}
