import { ButtonInteraction } from 'discord.js';
import { Client } from '../utils/classes.js';
export declare class Component {
    regex: RegExp;
    client: Client;
    constructor(client: Client, regex: RegExp);
    button(interaction: ButtonInteraction): void;
}
