import { Client as BaseClient, ClientOptions as BaseClientOptions } from 'discord.js';
import CommandManager from '../handlers/CommandManager.js';
import i18n, { ConfigurationOptions } from 'i18n';
export interface ClientOptions extends BaseClientOptions {
    routes: {
        commands: string;
        events: string;
        interactions: string;
    };
    i18n: ConfigurationOptions;
}
export default class Client extends BaseClient<true> {
    version: string;
    i18n: typeof i18n;
    commands: CommandManager;
    routes: {
        interactions: string;
    };
    constructor(options: ClientOptions);
    get embedFooter(): {
        text: string;
        iconURL: string;
    };
    private _onReady;
    initializeEventListener(path: string): Promise<void> | Promise<number>;
}
