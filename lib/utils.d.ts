import { TextChannel, GuildMember, Message, BaseInteraction } from 'discord.js';
export declare function sleep(ms?: number): Promise<unknown>;
export declare function capitalize(input: string): string;
export declare function checkSend(channel: TextChannel, member: GuildMember): boolean;
export declare function filledBar(current: number, length?: number, barrChar?: string): string;
export declare function randomId(): string;
export declare const Translator: (interaction: BaseInteraction | Message<true>) => (phrase: string, params?: object) => string;
