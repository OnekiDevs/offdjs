import client from '../index.js';
import { SlashCommandBuilder } from 'discord.js';
export default class Command {
    hibrid = false;
    name;
    description;
    local_names;
    local_descriptions;
    global = true;
    options = [];
    dm = true;
    permissions = null;
    constructor({ name, description, global = true, options = [], dm = true, permissions, hibrid = false }) {
        this.name = name['en-US'];
        this.description = description['en-US'];
        this.local_names = name;
        this.local_descriptions = description;
        this.global = global;
        this.options = options;
        this.dm = dm;
        this.hibrid = hibrid;
        if (permissions)
            this.permissions = permissions;
    }
    async deploy(guild) {
        if (this.global)
            return client.application.commands.create(await this.createData()).catch(console.error);
        if (guild)
            return guild.commands.create(await this.createData(guild)).catch((e) => {
                if (e.message.includes('Missing Access'))
                    console.log('Missing Access on', guild.name, guild.id);
                else
                    console.error(e);
            });
        return Promise.all(client.guilds.cache.map(async (guild) => guild.commands.create(await this.createData(guild)).catch((e) => {
            if (e.message.includes('Missing Access'))
                console.log('Missing Access on', guild.name, guild.id);
            else
                console.error(e);
        })));
    }
    get data() {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setNameLocalizations(this.local_names)
            .setDescriptionLocalizations(this.local_descriptions)
            .setDefaultMemberPermissions(this.permissions?.bitfield ?? 0)
            .setDMPermission(this.dm)
            .toJSON();
        command.options = this.parseOptions(this.options);
        return command;
    }
    get baseCommand() {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setNameLocalizations(this.local_names)
            .setDescriptionLocalizations(this.local_descriptions)
            .setDefaultMemberPermissions(this.permissions?.bitfield ?? 0)
            .setDMPermission(this.dm)
            .toJSON();
        command.options = this.parseOptions(this.options);
        return command;
    }
    parseOptions(option = []) {
        return option.map((o) => ({
            ...o,
            name_localizations: o.name,
            name: o.name['en-US'],
            description_localizations: o.description,
            description: o.description['en-US'],
            choices: o.type === 3 || o.type === 4 || o.type === 10
                ? o.choices?.map((c) => ({
                    ...c,
                    name_localizations: typeof c.name === 'string' ? null : c.name,
                    name: typeof c.name === 'string' ? c.name : c.name['en-US'],
                    value: c.value
                }))
                : null,
            options: 'options' in o ? this.parseOptions(o.options) : undefined
        }));
    }
    async createData(guild) {
        return this.baseCommand;
    }
    async interaction(interaction) {
        return interaction.deferReply();
    }
    async message(message, args) {
        return message;
    }
    async button(interaction) {
        return interaction.deferUpdate();
    }
    async select(interaction) {
        return interaction.deferUpdate();
    }
    async autocomplete(interaction) {
        return interaction.respond([]);
    }
    async modal(interaction) {
        return interaction.deferReply();
    }
    addOption(command, option) {
        if (command.options?.find((o) => o.name['en-US'] === option.name['en-US'])) {
            const i = this.options.findIndex((o) => o.name['en-US'] === option.name['en-US']);
            command.options.splice(i, 1, this.parseOptions([option]));
        }
        else if (!command.options?.length)
            command.options = [this.parseOptions([option])];
        return command;
    }
    clearOptions() {
        this.options = [];
        return this;
    }
}
