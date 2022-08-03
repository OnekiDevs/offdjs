import { Command } from '../utils/classes.js';
export default class Test extends Command {
    constructor() {
        super({
            name: {
                'en-US': 'test',
                'es-ES': 'test'
            },
            description: {
                'en-US': 'Test command',
                'es-ES': 'Comando de test'
            }
        });
    }
    async interaction(interaction) {
        interaction.reply('test...');
    }
    async message(message, _args) {
        message.reply('test...');
    }
    async button(interaction) {
        interaction.reply('test...');
    }
    async autocomplete(interaction) {
        interaction.respond([
            {
                name: 'test',
                value: 'test'
            }
        ]);
    }
    async modal(interaction) {
        interaction.reply('test...');
    }
    async select(interaction) {
        interaction.reply('test...');
    }
}
