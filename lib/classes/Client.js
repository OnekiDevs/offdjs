import { Client as BaseClient, InteractionType } from 'discord.js';
import { createRequire } from 'module';
import CommandManager from '../handlers/CommandManager.js';
import ComponentManager from '../handlers/ComponentManager.js';
import i18n from 'i18n';
import { join } from 'path';
import { readdirSync } from 'fs';
const version = createRequire(import.meta.url)('../../package.json').version;
export default class Client extends BaseClient {
    version;
    i18n = i18n;
    commands;
    components;
    constructor(options) {
        super(options);
        this.commands = new CommandManager(options.routes.commands);
        this.components = new ComponentManager(options.routes.components);
        this.i18n.configure(options.i18n);
        this.version = version ?? '1.0.0';
        this.initializeEventListener(options.routes.events).then((c) => {
            if (c)
                console.log('\x1b[35m%s\x1b[0m', 'Eventos Cargados!!');
        });
        this.once('ready', () => this._onReady());
    }
    get embedFooter() {
        return {
            text: `${this.user?.username} Bot v${this.version}`,
            iconURL: this.user?.avatarURL()
        };
    }
    async _onReady() {
        await this.commands.deploy();
        if (this.commands.size)
            console.log('\x1b[32m%s\x1b[0m', 'Comandos Desplegados!!');
        this.on('interactionCreate', (interaction) => {
            if (interaction.isChatInputCommand())
                this.commands
                    .get(interaction.commandName)
                    ?.interaction(interaction);
            if (interaction.isButton()) {
                this.commands
                    .find((cmd) => interaction.customId.startsWith(cmd.name))
                    ?.button(interaction);
                this.components
                    .find((btn) => btn.regexp.test(interaction.customId))
                    ?.button(interaction);
            }
            if (interaction.type === InteractionType.ModalSubmit) {
                this.commands
                    .find((cmd) => interaction.customId.startsWith(cmd.name))
                    ?.modal(interaction);
                this.components
                    .find((btn) => btn.regexp.test(interaction.customId))
                    ?.modal(interaction);
            }
            if (interaction.type === InteractionType.ApplicationCommandAutocomplete)
                this.commands
                    .get(interaction.commandName)
                    ?.autocomplete(interaction);
            if (interaction.isSelectMenu()) {
                this.commands
                    .find((cmd) => interaction.customId.startsWith(cmd.name))
                    ?.select(interaction);
                this.components
                    .find((btn) => btn.regexp.test(interaction.customId))
                    ?.select(interaction);
            }
        });
        console.log('\x1b[31m%s\x1b[0m', `${this.user?.username} ${this.version} ready!!!`);
    }
    initializeEventListener(path) {
        try {
            return Promise.all(readdirSync(path, { withFileTypes: true }).map(async (file) => {
                if (file.isDirectory()) {
                    readdirSync(join(path, file.name))
                        .filter((f) => f.endsWith('.event.js'))
                        .forEach(async (f) => {
                        const event = await import('file:///' + join(path, file.name, f));
                        const [eventName] = f.split('.');
                        this.on(eventName, (...args) => event.default(...args));
                    });
                }
                else if (file.name.endsWith('.event.js')) {
                    const event = await import('file:///' + join(path, file.name));
                    const [eventName] = file.name.split('.');
                    this.on(eventName, (...args) => event.default(...args));
                }
            })).then((r) => r.length);
        }
        catch (error) {
            return Promise.resolve();
        }
    }
}
