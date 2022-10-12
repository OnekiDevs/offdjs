import {
    TextChannel,
    GuildMember,
    PermissionsBitField,
    Message,
    BaseInteraction,
    ApplicationCommandData,
    ApplicationCommandType,
    UserApplicationCommandData,
    PermissionResolvable,
    PermissionFlagsBits,
    ChatInputApplicationCommandData,
    Locale,
    LocaleString,
    LocalizationMap,
    CommandInteractionOption,
    ApplicationCommandOptionType,
    RESTPostAPIApplicationCommandsJSONBody,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
    APIApplicationCommandOption,
    APIApplicationCommandSubcommandOption,
    APIApplicationCommandSubcommandGroupOption,
    APIApplicationCommandStringOption,
    APIApplicationCommandIntegerOption,
    APIApplicationCommandBooleanOption,
    APIApplicationCommandUserOption,
    APIApplicationCommandChannelOption,
    APIApplicationCommandRoleOption,
    APIApplicationCommandMentionableOption,
    APIApplicationCommandNumberOption,
    APIApplicationCommandAttachmentOption,
    APIApplicationCommandOptionChoice,
    APIApplicationCommandBasicOption,
    MessageApplicationCommandData
} from 'discord.js'
import client from './index.js'
import { z } from 'zod'

export const ApiPermissionFlagsBits = {
    create_instant_invite: 1n,
    kick_members: 2n,
    ban_members: 4n,
    administrator: 8n,
    manage_channels: 16n,
    manage_guild: 32n,
    add_reactions: 64n,
    view_audit_log: 128n,
    priority_speaker: 256n,
    stream: 512n,
    view_channel: 1024n,
    send_messages: 2048n,
    send_t_t_s_messages: 4096n,
    manage_messages: 8192n,
    embed_links: 16384n,
    attach_files: 32768n,
    read_message_history: 65536n,
    mention_everyone: 131072n,
    use_external_emojis: 262144n,
    view_guild_insights: 524288n,
    connect: 1048576n,
    speak: 2097152n,
    mute_members: 4194304n,
    deafen_members: 8388608n,
    move_members: 16777216n,
    use_v_a_d: 33554432n,
    change_nickname: 67108864n,
    manage_nicknames: 134217728n,
    manage_roles: 268435456n,
    manage_webhooks: 536870912n,
    manage_emojis_and_stickers: 1073741824n,
    use_application_commands: 2147483648n,
    request_to_speak: 4294967296n,
    manage_events: 8589934592n,
    manage_threads: 17179869184n,
    create_public_threads: 34359738368n,
    create_private_threads: 68719476736n,
    use_external_stickers: 137438953472n,
    send_messages_in_threads: 274877906944n,
    use_embedded_activities: 549755813888n,
    moderate_members: 1099511627776n
}
/**
 * Sleep() returns a Promise that resolves after a given number of milliseconds.
 * @param {number} ms - The number of milliseconds to wait before resolving the promise.
 * @returns A promise that resolves after a certain amount of time.
 */
export function sleep(ms: number = 1_000) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * It takes a string, capitalizes the first letter, and lowercases the rest
 * @param {string} input - The string to capitalize.
 * @returns {string} - A function that takes a string as an argument and returns a string.
 */
export function capitalize(input: string): string {
    return input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase()
}

/**
 * It checks if the member has the permission to send messages and view the channel
 * @param {TextChannel} channel - TextChannel - The channel you want to check
 * @param {GuildMember} member - GuildMember - The member you want to check
 * @returns {boolean} A boolean value.
 */
export function checkSend(channel: TextChannel, member: GuildMember): boolean {
    return channel
        .permissionsFor(member)
        .has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel], true)
}

/**
 * generate a string barr progges
 * @param {number} current the current percentage to show
 * @param {number} length the length of the barr
 * @param {string} barrChar the char to use for the barr
 * @returns a string bar
 */
export function filledBar(current: number, length = 25, barrChar = '█'): string {
    const progress = Math.round(length * (current / 100))
    const emptyProgress = length - progress
    return barrChar.repeat(progress) + ' '.repeat(emptyProgress)
}

/**
 * It returns a random string of 8 characters.
 * @returns {string} A random string of 8 characters.
 */
export function randomId() {
    return Math.random().toString().slice(-8)
}

/**
 * It takes an interaction and returns a function that takes a phrase and returns a translation
 * @param {Interaction} interaction - Interaction - The interaction object that contains the locale and client.
 * @returns {transalte} A function that takes a phrase and params and returns a string.
 */
export const Translator = function (interaction: BaseInteraction | Message<true>) {
    let lang: string = interaction instanceof BaseInteraction ? interaction.locale : interaction.guild.preferredLocale
    const i18n = client.i18n

    /**
     * It takes a phrase and an optional object of parameters, and returns a translated string
     * @param {string} phrase - The phrase to translate
     * @param {object} [params] - An object whit the parameters to replace
     * @returns {string} - The function translate is being returned.
     */
    return (phrase: string, params?: object): string => {
        return i18n.__mf({ phrase, locale: lang }, params)
    }
}

export function parseAPICommand(command: ApplicationCommandData): RESTPostAPIApplicationCommandsJSONBody {
    if (command.type === ApplicationCommandType.User) {
        // UserApplicationCommandData
        if (!command.name?.length) throw new Error('Command name is required')
        return parseUserApplicationCommandData(command as UserApplicationCommandData)
    } else if (command.type === ApplicationCommandType.Message) {
        // MessageApplicationCommandData
        if (!command.name?.length) throw new Error('Command name is required')
        return parseMessageApplicationCommandData(command as MessageApplicationCommandData)
    } else {
        if (!command.name?.length) throw new Error('Command name is required')
        return parseChatInputApplicationCommandData(command as ChatInputApplicationCommandData)
    }
}

export function parseUserApplicationCommandData(command: UserApplicationCommandData) {
    if (typeof command.name !== 'string') throw new Error('Command name is required')
    const api: RESTPostAPIContextMenuApplicationCommandsJSONBody = {
        type: 2,
        name: String(command.name).substring(0, 32)
    }

    if (command.defaultMemberPermissions !== null && command.defaultMemberPermissions !== undefined)
        api.default_member_permissions = String(resolvePermissions(command.defaultMemberPermissions))

    if (command.dmPermission !== null && command.dmPermission !== undefined) api.dm_permission = !!command.dmPermission

    if (command.nameLocalizations) api.name_localizations = parseNameLocalizations(command.nameLocalizations)

    return api
}

export function parseMessageApplicationCommandData(command: MessageApplicationCommandData) {
    if (typeof command.name !== 'string') throw new Error('Command name is required')
    const api: RESTPostAPIContextMenuApplicationCommandsJSONBody = {
        type: 3,
        name: String(command.name).substring(0, 32)
    }

    if (command.defaultMemberPermissions !== null && command.defaultMemberPermissions !== undefined)
        api.default_member_permissions = String(resolvePermissions(command.defaultMemberPermissions))

    if (command.dmPermission !== null && command.dmPermission !== undefined) api.dm_permission = !!command.dmPermission

    if (command.nameLocalizations) api.name_localizations = parseNameLocalizations(command.nameLocalizations)

    return api
}

export function parseChatInputApplicationCommandData(command: ChatInputApplicationCommandData) {
    if (typeof command.name !== 'string') throw new Error('Command name is required')
    const name = String(command.name).toLowerCase().substring(0, 32).replace(/ +/g, '-')
    const rg = z.string().regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    if (!rg.safeParse(name).success) throw new Error('Command name is invalid')
    const api: RESTPostAPIChatInputApplicationCommandsJSONBody = {
        type: 1,
        name: name,
        description: String(command.description).substring(0, 100) || '...'
    }

    if (command.defaultMemberPermissions !== null && command.defaultMemberPermissions !== undefined)
        api.default_member_permissions = String(resolvePermissions(command.defaultMemberPermissions))

    if (command.nameLocalizations) api.name_localizations = parseNameLocalizations(command.nameLocalizations)

    if (command.descriptionLocalizations)
        api.description_localizations = parseDescriptionLocalizations(command.descriptionLocalizations)

    if (command.options?.length) api.options = parseCommandOption(...command.options)

    return api
}

export function resolvePermissions(permissions: PermissionResolvable) {
    if (Array.isArray(permissions)) {
        const p = [0n]
        for (const permission of permissions) {
            const np = resolvePermissions(permission)
            p.push(np)
        }
        return p.reduce((a, b) => a | b)
    } else if (typeof permissions === 'bigint') {
        return permissions
    } else if (typeof permissions === 'string') {
        if (Object.keys(PermissionFlagsBits).includes(permissions))
            return PermissionFlagsBits[permissions as keyof typeof PermissionFlagsBits]
        else if (Object.keys(ApiPermissionFlagsBits).includes(permissions))
            return ApiPermissionFlagsBits[permissions as keyof typeof ApiPermissionFlagsBits]
        else return 0n
    } else if (typeof permissions === 'number') {
        return BigInt(permissions)
    } else return 0n
}

export function parseCamellToSnakeCase(s: string) {
    return s.replace(/([A-Z])/g, (g) => `_${g[0].toLowerCase()}`)
}

export function parseSnakeToCamellCase(s: string) {
    return s.replace(/([_][a-z])/g, (g) => g[1].toUpperCase())
}

export function parseNameLocalizations(localizations: LocalizationMap) {
    const local: LocalizationMap = {}
    for (const [key, value] of Object.entries(localizations)) {
        const rg = z.string().regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
        if (Object.keys(Locale).includes(key)) {
            const name = String(value).toLowerCase().replace(/ +/g, '-').substring(0, 32)
            if (!rg.safeParse(name).success) throw new Error('Option name is invalid')
            local[key as LocaleString] = name
        }
    }
    return local
}

export function parseDescriptionLocalizations(localizations: LocalizationMap) {
    const local: LocalizationMap = {}
    for (const [key, value] of Object.entries(localizations)) {
        if (Object.keys(Locale).includes(key)) {
            const name = String(value).substring(0, 100)
            local[key as LocaleString] = name
        }
    }
    return local
}

function parseCommandOption(...option: CommandInteractionOption[]): APIApplicationCommandOption[] {
    const op: APIApplicationCommandOption[] = []
    for (const o of option) {
        if (typeof o.name !== 'string') throw new Error('Option name is required')
        if (o.type === ApplicationCommandOptionType.Subcommand) {
            const opt = parseSubcommandCommandOption(o)
            op.push(opt)
        } else if (o.type === ApplicationCommandOptionType.SubcommandGroup) {
            const opt = parseSubcommandGroupCommandOption(o)
            op.push(opt)
        } else if (o.type === ApplicationCommandOptionType.String || o.type === undefined) {
            const opt = parseStringCommandOption(o)
            op.push(opt)
        } else if (o.type === ApplicationCommandOptionType.Integer) {
            const opt = parseIntegerCommandOption(o)
            op.push(opt)
        } else if (o.type === ApplicationCommandOptionType.Boolean) {
            const opt = parseBooleanCommandOption(o)
            op.push(opt)
        } else if (o.type === ApplicationCommandOptionType.User) {
            const opt = parseUserCommandOption(o)
            op.push(opt)
        } else if (o.type === ApplicationCommandOptionType.Channel) {
            const opt = parseChannelCommandOption(o)
            op.push(opt)
        } else if (o.type === ApplicationCommandOptionType.Role) {
            const opt = parseRoleCommandOption(o)
            op.push(opt)
        } else if (o.type === ApplicationCommandOptionType.Mentionable) {
            const opt = parseMentionableCommandOption(o)
            op.push(opt)
        } else if (o.type === ApplicationCommandOptionType.Number) {
            const opt = parseNumberCommandOption(o)
            op.push(opt)
        } else if (o.type === ApplicationCommandOptionType.Attachment) {
            const opt = parseAttachmentCommandOption(o)
            op.push(opt)
        }
    }
    return op
}

export { parseCommandOption }

// ! subcommand
export function parseSubcommandCommandOption(option: commandOption): APIApplicationCommandSubcommandOption {
    if (typeof option.name !== 'string') throw new Error('Option name is required')
    const name = String(option.name).toLowerCase().replace(/ +/g, '-').substring(0, 32)
    const rg = z.string().regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    if (!rg.safeParse(name).success) throw new Error('Option name is invalid')
    const op: APIApplicationCommandSubcommandOption = {
        type: ApplicationCommandOptionType.Subcommand,
        name,
        description: String(option.descripton).substring(0, 100) || '...'
    }

    if (option.nameLocalizations) op.name_localizations = parseNameLocalizations(option.nameLocalizations)

    if (option.descriptionLocalizations)
        op.description_localizations = parseDescriptionLocalizations(option.descriptionLocalizations)

    if (option.options?.length) {
        let opts = parseCommandOption(...option.options)
        opts = opts.filter(
            (o) =>
                o.type !== ApplicationCommandOptionType.SubcommandGroup &&
                o.type !== ApplicationCommandOptionType.Subcommand
        )
        if (opts.length) op.options = opts as APIApplicationCommandBasicOption[]
    }

    return op
}

// ! subcommand group
export function parseSubcommandGroupCommandOption(option: commandOption): APIApplicationCommandSubcommandGroupOption {
    if (typeof option.name !== 'string') throw new Error('Option name is required')
    const name = String(option.name).toLowerCase().replace(/ +/g, '-').substring(0, 32)
    const rg = z.string().regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    if (!rg.safeParse(name).success) throw new Error('Option name is invalid')
    const op: APIApplicationCommandSubcommandGroupOption = {
        type: ApplicationCommandOptionType.SubcommandGroup,
        name,
        description: String(option.descripton).substring(0, 100) || '...',
        options: []
    }

    if (option.nameLocalizations) op.name_localizations = parseNameLocalizations(option.nameLocalizations)

    if (option.descriptionLocalizations)
        op.description_localizations = parseDescriptionLocalizations(option.descriptionLocalizations)

    if (option.options && option.options.length) {
        for (const o of option.options) {
            const opt = parseSubcommandCommandOption(o)
            op.options?.push(opt)
        }
    }

    return op
}

// ! string
export function parseStringCommandOption(option: commandOption): APIApplicationCommandStringOption {
    if (typeof option.name !== 'string') throw new Error('Option name is required')
    const name = String(option.name).toLowerCase().replace(/ +/g, '-').substring(0, 32)
    const rg = z.string().regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    if (!rg.safeParse(name).success) throw new Error('Option name is invalid')
    const op: APIApplicationCommandStringOption = {
        type: ApplicationCommandOptionType.String,
        name,
        description: String(option.descripton).substring(0, 100) || '...',
        autocomplete: !!option.autocomplete
    }

    if (option.nameLocalizations) op.name_localizations = parseNameLocalizations(option.nameLocalizations)

    if (option.descriptionLocalizations)
        op.description_localizations = parseDescriptionLocalizations(option.descriptionLocalizations)

    if (option.required) op.required = option.required

    if (option.choices?.length && !op.autocomplete) {
        const choices: APIApplicationCommandOptionChoice<string>[] = []
        for (const c of option.choices) {
            const choice: APIApplicationCommandOptionChoice<string> = {
                name: String(c.name).substring(0, 100),
                value: String(c.value).substring(0, 100)
            }
            if (option.nameLocalizations) choice.name_localizations = parseNameLocalizations(option.nameLocalizations)
            choices.push(choice)
        }
        op.choices = choices
    }

    if (typeof option.maxLength === 'number') op.max_length = option.maxLength

    if (typeof option.minLength === 'number') op.min_length = option.minLength

    return op
}

// ! integer
export function parseIntegerCommandOption(option: commandOption): APIApplicationCommandIntegerOption {
    if (typeof option.name !== 'string') throw new Error('Option name is required')
    const name = String(option.name).toLowerCase().replace(/ +/g, '-').substring(0, 32)
    const rg = z.string().regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    if (!rg.safeParse(name).success) throw new Error('Option name is invalid')
    const op: APIApplicationCommandIntegerOption = {
        type: ApplicationCommandOptionType.Integer,
        name,
        description: String(option.descripton).substring(0, 100) || '...',
        autocomplete: !!option.autocomplete
    }

    if (option.nameLocalizations) op.name_localizations = parseNameLocalizations(option.nameLocalizations)

    if (option.descriptionLocalizations)
        op.description_localizations = parseDescriptionLocalizations(option.descriptionLocalizations)

    if (option.required) op.required = option.required

    if (option.choices?.length && !op.autocomplete) {
        const choices: APIApplicationCommandOptionChoice<number>[] = []
        for (const c of option.choices) {
            const value = Number(c.value)
            if (isNaN(value)) throw new Error('Choice value is not a number')
            const choice: APIApplicationCommandOptionChoice<number> = {
                name: String(c.name).substring(0, 100),
                value
            }
            if (option.nameLocalizations) choice.name_localizations = parseNameLocalizations(option.nameLocalizations)
            choices.push(choice)
        }
        op.choices = choices
    }

    if (typeof option.maxValue === 'number') op.max_value = option.maxValue

    if (typeof option.minValue === 'number') op.min_value = option.minValue

    return op
}

// ! boolean
export function parseBooleanCommandOption(option: commandOption) {
    if (typeof option.name !== 'string') throw new Error('Option name is required')
    const name = String(option.name).toLowerCase().replace(/ +/g, '-').substring(0, 32)
    const rg = z.string().regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    if (!rg.safeParse(name).success) throw new Error('Option name is invalid')
    const op: APIApplicationCommandBooleanOption = {
        type: ApplicationCommandOptionType.Boolean,
        name,
        description: String(option.descripton).substring(0, 100) || '...'
    }

    if (option.nameLocalizations) op.name_localizations = parseNameLocalizations(option.nameLocalizations)

    if (option.descriptionLocalizations)
        op.description_localizations = parseDescriptionLocalizations(option.descriptionLocalizations)

    if (option.required) op.required = option.required

    return op
}

// ! user
export function parseUserCommandOption(option: commandOption) {
    if (typeof option.name !== 'string') throw new Error('Option name is required')
    const name = String(option.name).toLowerCase().replace(/ +/g, '-').substring(0, 32)
    const rg = z.string().regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    if (!rg.safeParse(name).success) throw new Error('Option name is invalid')
    const op: APIApplicationCommandUserOption = {
        type: ApplicationCommandOptionType.User,
        name,
        description: String(option.descripton).substring(0, 100) || '...'
    }

    if (option.nameLocalizations) op.name_localizations = parseNameLocalizations(option.nameLocalizations)

    if (option.descriptionLocalizations)
        op.description_localizations = parseDescriptionLocalizations(option.descriptionLocalizations)

    if (option.required) op.required = option.required

    return op
}

// ! channel
export function parseChannelCommandOption(option: commandOption): APIApplicationCommandChannelOption {
    if (typeof option.name !== 'string') throw new Error('Option name is required')
    const name = String(option.name).toLowerCase().replace(/ +/g, '-').substring(0, 32)
    const rg = z.string().regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    if (!rg.safeParse(name).success) throw new Error('Option name is invalid')
    const op: APIApplicationCommandChannelOption = {
        type: ApplicationCommandOptionType.Channel,
        name,
        description: String(option.descripton).substring(0, 100) || '...'
    }

    if (option.nameLocalizations) op.name_localizations = parseNameLocalizations(option.nameLocalizations)

    if (option.descriptionLocalizations)
        op.description_localizations = parseDescriptionLocalizations(option.descriptionLocalizations)

    if (option.required) op.required = option.required

    if (option.channelTypes && option.channelTypes.length) op.channel_types = option.channelTypes

    return op
}

// ! role
export function parseRoleCommandOption(option: commandOption): APIApplicationCommandRoleOption {
    if (typeof option.name !== 'string') throw new Error('Option name is required')
    const name = String(option.name).toLowerCase().replace(/ +/g, '-').substring(0, 32)
    const rg = z.string().regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    if (!rg.safeParse(name).success) throw new Error('Option name is invalid')
    const op: APIApplicationCommandRoleOption = {
        type: ApplicationCommandOptionType.Role,
        name,
        description: String(option.descripton).substring(0, 100) || '...'
    }

    if (option.nameLocalizations) op.name_localizations = parseNameLocalizations(option.nameLocalizations)

    if (option.descriptionLocalizations)
        op.description_localizations = parseDescriptionLocalizations(option.descriptionLocalizations)

    if (option.required) op.required = option.required

    return op
}

// ! mentionable
export function parseMentionableCommandOption(option: commandOption): APIApplicationCommandMentionableOption {
    if (typeof option.name !== 'string') throw new Error('Option name is required')
    const name = String(option.name).toLowerCase().replace(/ +/g, '-').substring(0, 32)
    const rg = z.string().regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    if (!rg.safeParse(name).success) throw new Error('Option name is invalid')
    const op: APIApplicationCommandMentionableOption = {
        type: ApplicationCommandOptionType.Mentionable,
        name,
        description: String(option.descripton).substring(0, 100) || '...'
    }

    if (option.nameLocalizations) op.name_localizations = parseNameLocalizations(option.nameLocalizations)

    if (option.descriptionLocalizations)
        op.description_localizations = parseDescriptionLocalizations(option.descriptionLocalizations)

    if (option.required) op.required = option.required

    return op
}

// ! number
export function parseNumberCommandOption(option: commandOption): APIApplicationCommandNumberOption {
    if (typeof option.name !== 'string') throw new Error('Option name is required')
    const name = String(option.name).toLowerCase().replace(/ +/g, '-').substring(0, 32)
    const rg = z.string().regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    if (!rg.safeParse(name).success) throw new Error('Option name is invalid')
    const op: APIApplicationCommandNumberOption = {
        type: ApplicationCommandOptionType.Number,
        name,
        description: String(option.descripton).substring(0, 100) || '...'
    }

    if (option.nameLocalizations) op.name_localizations = parseNameLocalizations(option.nameLocalizations)

    if (option.descriptionLocalizations)
        op.description_localizations = parseDescriptionLocalizations(option.descriptionLocalizations)

    if (option.required) op.required = option.required

    if (typeof option.maxValue === 'number') op.max_value = option.maxValue

    if (typeof option.minValue === 'number') op.min_value = option.minValue

    if (option.choices && option.choices.length) {
        const choices = []
        for (const c of option.choices) {
            const value = parseInt(String(c.value))
            if (isNaN(value)) throw new Error('Choice value is not a number')
            const choice: { name: string; name_localizations?: LocalizationMap; value: number } = {
                name: String(c.name).substring(0, 100),
                value
            }
            if (option.nameLocalizations) choice.name_localizations = parseNameLocalizations(option.nameLocalizations)
            choices.push(choice)
        }
        op.choices = choices
    }

    return op
}

// ! attachment
export function parseAttachmentCommandOption(option: commandOption): APIApplicationCommandAttachmentOption {
    if (typeof option.name !== 'string') throw new Error('Option name is required')
    const name = String(option.name).toLowerCase().replace(/ +/g, '-').substring(0, 32)
    const rg = z.string().regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    if (!rg.safeParse(name).success) throw new Error('Option name is invalid')
    const op: APIApplicationCommandAttachmentOption = {
        type: ApplicationCommandOptionType.Attachment,
        name,
        description: String(option.descripton).substring(0, 100) || '...'
    }

    if (option.nameLocalizations) op.name_localizations = parseNameLocalizations(option.nameLocalizations)

    if (option.descriptionLocalizations)
        op.description_localizations = parseDescriptionLocalizations(option.descriptionLocalizations)

    if (option.required) op.required = option.required

    return op
}

export type commandOption = {
    type: number
    name: string
    descripton?: string
    nameLocalizations?: LocalizationMap
    descriptionLocalizations?: LocalizationMap
    required?: boolean
    options?: commandOption[]
    choices?: { name: string; nameLocalizations?: LocalizationMap; value: string | number }[]
    minLength?: number
    maxLength?: number
    minValue?: number
    maxValue?: number
    autocomplete?: boolean
    channelTypes?: number[]
}
