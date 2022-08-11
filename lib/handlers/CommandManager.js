import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
export default class CommandManager extends Collection {
    subcommands = new Collection();
    constructor(path) {
        super();
        try {
            for (const file of readdirSync(path, { withFileTypes: true })) {
                if (file.isDirectory()) {
                    for (const f of readdirSync(join(path, file.name), { withFileTypes: true })) {
                        if (f.name.endsWith('.command.js'))
                            import('file:///' + join(path, file.name, f.name)).then((command) => {
                                const cmd = new command.default();
                                this.set(cmd.name, cmd);
                            });
                    }
                }
                else if (file.name.endsWith('.command.js'))
                    import('file:///' + join(path, file.name)).then((command) => {
                        const cmd = new command.default();
                        this.set(cmd.name, cmd);
                    });
            }
        }
        catch (error) {
        }
    }
    deploy(guild) {
        if (process.env.DEPLOY_COMMANDS == 'true')
            return Promise.all(this.map((command) => command.deploy(guild)));
        else
            return Promise.resolve();
    }
}
