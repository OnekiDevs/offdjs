import Client from './classes/Client.js';
import { ConfigurationOptions } from 'i18n';
export * from './utils.js';
export * from './classes/Command.js';
export * from './classes/Component.js';
export { Client };
declare let config: {
    intents: import("discord.js").GatewayIntentBits[];
    root: string;
    i18n: ConfigurationOptions;
};
declare const _default: Client;
export default _default;
export declare type Config = typeof config;
