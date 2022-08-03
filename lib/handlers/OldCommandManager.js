import { readdirSync } from 'fs';
import { Collection } from 'discord.js';
import { join } from 'path';
export class OldCommandManager extends Collection {
    constructor(client, path) {
        super();
        try {
            for (const file of readdirSync(path).filter(f => f.includes('.oldCommand.'))) {
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
    getCommand(name) {
        return this.find(c => {
            return (c.name === name.toLowerCase() ||
                c.alias.includes(name.toLowerCase()));
        });
    }
}
