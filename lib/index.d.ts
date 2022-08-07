import Client from './utils/classes.js';
import { ConfigurationOptions } from 'i18n';
declare let config: {
    intents: import("discord.js").GatewayIntentBits[];
    root: string;
    i18n: ConfigurationOptions;
};
declare const _default: Client;
export default _default;
export declare type Config = typeof config;
