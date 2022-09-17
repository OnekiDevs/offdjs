import { ChatInputCommandInteraction, AutocompleteInteraction, ModalSubmitInteraction, SelectMenuInteraction, PermissionsBitField, ButtonInteraction, Message, Guild, ApplicationCommandOptionType, ChannelType, ApplicationCommandType, LocaleString, Interaction } from 'discord.js';
export default class Command {
    hibrid: boolean;
    name: string;
    description: string;
    local_names: Local;
    local_descriptions: Local;
    global: boolean;
    options: CommandOptions[];
    dm: boolean;
    permissions: PermissionsBitField | null;
    constructor({ name, description, global, options, dm, permissions, hibrid, }: cmdOptions);
    deploy(guild?: Guild): Promise<void | import("discord.js").ApplicationCommand<{
        guild: import("discord.js").GuildResolvable;
    }> | (void | import("discord.js").ApplicationCommand<{}>)[]>;
    get data(): any;
    get baseCommand(): ApiCommand;
    parseOptions(option?: CommandOptions[]): any;
    createData(guild?: Guild): Promise<ApiCommand>;
    interaction(interaction: Interaction): Promise<any>;
    chatInputCommandInteraction(interaction: ChatInputCommandInteraction<'cached'>): Promise<any>;
    message(message: Message<true>, args: string[]): Promise<any>;
    button(interaction: ButtonInteraction<'cached'>): Promise<any>;
    select(interaction: SelectMenuInteraction<'cached'>): Promise<any>;
    autocomplete(interaction: AutocompleteInteraction<'cached'>): Promise<any>;
    modal(interaction: ModalSubmitInteraction<'cached'>): Promise<any>;
    addOption(command: ApiCommand, option: CommandOptions): ApiCommand;
    clearOptions(): this;
}
interface cmdOptions {
    name: Local;
    description: Local;
    global?: boolean;
    options?: CommandOptions[];
    dm?: boolean;
    permissions?: PermissionsBitField;
    hibrid?: boolean;
}
export interface ChoicesIntegerCommandOption {
    name: Local | string;
    value: number;
}
export interface ChoicesStringCommandOption {
    name: Local | string;
    value: string;
}
export interface BaseCommandOption {
    name: Local;
    description: Local;
    required?: boolean;
}
export interface SubcommandCommandOptions {
    type: ApplicationCommandOptionType.Subcommand;
    name: Local;
    description: Local;
    options?: CommandOptions[];
}
export interface SubcommandGroupCommandOptions {
    type: ApplicationCommandOptionType.SubcommandGroup;
    options?: SubcommandCommandOptions[];
    name: Local;
    description: Local;
}
export interface StringCommandOptions extends BaseCommandOption {
    type: ApplicationCommandOptionType.String;
    choices?: ChoicesStringCommandOption[];
    autocomplete?: boolean;
    min_length?: number;
    max_length?: number;
}
export interface IntegerCommandOptions extends BaseCommandOption {
    type: ApplicationCommandOptionType.Integer;
    choices?: ChoicesIntegerCommandOption[];
    min_value?: number;
    max_value?: number;
}
export interface BooleanCommandOptions extends BaseCommandOption {
    type: ApplicationCommandOptionType.Boolean;
}
export interface UserCommandOptions extends BaseCommandOption {
    type: ApplicationCommandOptionType.User;
}
export interface ChannelCommandOptions extends BaseCommandOption {
    type: ApplicationCommandOptionType.Channel;
    channel_types?: ChannelType[];
}
export interface RoleCommandOptions extends BaseCommandOption {
    type: ApplicationCommandOptionType.Role;
}
export interface MentionableCommandOptions extends BaseCommandOption {
    type: ApplicationCommandOptionType.Mentionable;
}
export interface NumberCommandOptions extends BaseCommandOption {
    type: ApplicationCommandOptionType.Number;
    min_value?: number;
    max_value?: number;
    choices?: ChoicesIntegerCommandOption[];
}
export interface AttachmentCommandOptions extends BaseCommandOption {
    type: ApplicationCommandOptionType.Attachment;
}
export declare type CommandOptions = SubcommandCommandOptions | SubcommandGroupCommandOptions | StringCommandOptions | IntegerCommandOptions | BooleanCommandOptions | UserCommandOptions | ChannelCommandOptions | RoleCommandOptions | MentionableCommandOptions | NumberCommandOptions | AttachmentCommandOptions;
export declare type ApiCommand = {
    name: string;
    description: string;
    name_localizations?: Local;
    description_localizations?: Local;
    type: ApplicationCommandType;
    options?: any[];
    default_member_permissions?: string;
    dm_permission?: boolean;
    default_permission?: boolean;
};
export interface Local extends Partial<Record<LocaleString, string>> {
    'en-US': string;
}
export {};
