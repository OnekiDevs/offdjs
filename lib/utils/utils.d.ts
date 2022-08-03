/// <reference types="node" />
import { Client } from './classes.js';
import { PermissionResolvable, ChatInputCommandInteraction, TextChannel, GuildMember, Message, Utils, TextInputBuilder, ActionRowBuilder, BaseInteraction } from 'discord.js';
export { Utils };
export declare function sleep(ms?: number): Promise<unknown>;
export declare function capitalize(input: string): string;
export declare function permissionsError(interaction: ChatInputCommandInteraction | Message, permissions: PermissionResolvable[] | PermissionResolvable): void;
export declare function checkSend(channel: TextChannel, member: GuildMember): boolean;
export declare function filledBar(current: number, length?: number): string;
export declare const pollEmojis: string[];
export declare function randomId(): string;
export declare function imgToLink(img: Buffer, client: Client): Promise<string>;
export declare function sendError(error: Error, file: string): Promise<void>;
export declare const Translator: (interaction: BaseInteraction | Message<true>) => (phrase: string, params?: object) => string;
export declare enum PunishmentType {
    WARN = 0,
    KICK = 1,
    MUTE = 2,
    BAN = 3,
    HACKBAN = 4
}
export interface PunishUser {
    userId: string;
    type: PunishmentType;
    reason: string;
    duration?: string;
    moderatorId: string;
}
export interface Suggestion {
    interaction?: ChatInputCommandInteraction<'cached'> | null;
    message?: Message<true> | null;
}
export declare function createModalComponent(input: TextInputBuilder): ActionRowBuilder<TextInputBuilder>;
