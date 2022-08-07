import Component from '../classes/Component.js';
import { Collection } from 'discord.js';
export default class ComponentManager extends Collection<string, Component> {
    constructor(path: string);
}
