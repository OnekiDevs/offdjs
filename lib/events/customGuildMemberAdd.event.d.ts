import { GuildMember, Invite } from 'discord.js';
declare type JoinType = 'permissions' | 'normal' | 'vanity' | 'unknown';
export default function (member: GuildMember, type: JoinType, invite: Invite): Promise<import("discord.js").Message<boolean> | undefined>;
export {};
