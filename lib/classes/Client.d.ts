import { Client as BaseClient, Collection, Guild } from 'discord.js';
import { Firestore } from 'firebase-admin/firestore';
import { EmbedBuilder } from '@discordjs/builders';
import { WebSocket } from 'ws';
import { CommandManager, ClientOptions, ClientConstants, ComponentManager, OldCommandManager, Server } from '../utils/classes.js';
import i18n from 'i18n';
export declare class Client extends BaseClient<true> {
    db: Firestore;
    version: string;
    i18n: typeof i18n;
    commands: CommandManager;
    oldCommands: OldCommandManager;
    components: ComponentManager;
    websocket?: WebSocket;
    constants: ClientConstants;
    private _wsInterval;
    private _wsintent;
    embeds: Collection<string, {
        embed: EmbedBuilder;
        interactionId: string;
    }>;
    reconect: boolean;
    _wsw: boolean;
    constructor(options: ClientOptions);
    get embedFooter(): {
        text: string;
        iconURL: string;
    };
    private _initWebSocket;
    private _onReady;
    private _onWebSocketMessage;
    initializeEventListener(path: string): Promise<void[]>;
    private checkBans;
    private _checkBirthdays;
    newServer(guild: Guild): Server;
}
