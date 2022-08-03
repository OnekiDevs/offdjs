import { Message } from 'discord.js';
export default function (msg: Message<true>): Promise<string | Message<boolean> | undefined>;
