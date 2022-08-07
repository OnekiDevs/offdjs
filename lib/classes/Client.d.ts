import { Client as BaseClient } from 'discord.js';
import { CommandManager, ClientOptions, ClientConstants, ComponentManager, OldCommandManager } from '../utils/classes.js';
import i18n from 'i18n';
export declare class Client extends BaseClient<true> {
    version: string;
    i18n: typeof i18n;
    commands: CommandManager;
    oldCommands: OldCommandManager;
    components: ComponentManager;
    constants: ClientConstants;
    constructor(options: ClientOptions);
    get embedFooter(): {
        text: string;
        iconURL: string;
    };
    private _onReady;
    initializeEventListener(path: string): Promise<void> | Promise<number>;
}
