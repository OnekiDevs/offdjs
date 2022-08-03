import { Component, Client } from '../utils/classes.js';
import { Collection } from 'discord.js';
export declare class ComponentManager extends Collection<string, Component> {
    client: Client;
    constructor(client: Client, path: string);
}
