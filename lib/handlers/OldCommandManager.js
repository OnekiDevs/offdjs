import { readdirSync } from 'fs';
import { Collection } from 'discord.js';
import { join } from 'path';
export default class OldCommandManager extends Collection {
    constructor(path) {
        super();
        try {
            for (const file of readdirSync(path).filter((f) => f.includes('.oldCommand.'))) {
                import('file:///' + join(path, file)).then((command) => {
                    const cmd = new command.default();
                    this.set(cmd.name, cmd);
                });
            }
        }
        catch (error) {
        }
    }
    getCommand(name) {
        return this.find((c) => {
            return c.name === name.toLowerCase() || c.alias.includes(name.toLowerCase());
        });
    }
}
