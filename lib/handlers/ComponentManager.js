import { randomId } from '../utils/utils.js';
import { Collection } from 'discord.js';
import { join } from 'path';
import fs from 'fs';
export class ComponentManager extends Collection {
    client;
    constructor(client, path) {
        super();
        this.client = client;
        try {
            for (const file of fs.readdirSync(path).filter(f => f.includes('.component.'))) {
                import('file:///' + join(path, file)).then(componentClass => {
                    const component = new componentClass.default(client);
                    this.set(randomId(), component);
                });
            }
        }
        catch (error) {
            console.log('WARNING:', `${error}`);
        }
    }
}
