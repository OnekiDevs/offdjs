import { randomId } from '../utils.js';
import { Collection } from 'discord.js';
import { join } from 'path';
import { readdirSync } from 'fs';
export default class ComponentManager extends Collection {
    constructor(path) {
        super();
        try {
            for (const file of readdirSync(path).filter((f) => f.includes('.component.'))) {
                import('file:///' + join(path, file)).then((componentClass) => {
                    const component = new componentClass.default();
                    this.set(randomId(), component);
                });
            }
        }
        catch (error) {
        }
    }
}
