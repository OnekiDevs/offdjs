import { GuildMemberOptions } from '../utils/classes.js';
export default function ({ server, oldMember, newMember }: GuildMemberOptions): Promise<import("discord.js").Message<boolean> | undefined>;
