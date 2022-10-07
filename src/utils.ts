import {
    TextChannel,
    GuildMember,
    PermissionsBitField,
    Message,
    BaseInteraction
    // ApplicationCommandData,
    // ApplicationCommandType
} from 'discord.js'
import client from './index.js'

/**
 * Sleep() returns a Promise that resolves after a given number of milliseconds.
 * @param {number} ms - The number of milliseconds to wait before resolving the promise.
 * @returns A promise that resolves after a certain amount of time.
 */
export function sleep(ms: number = 1_000) {
    return new Promise(resolve => setTimeout(resolve, ms))
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

// /**
//  * Check if the command is valid
//  * @param {object} command the command to validate
//  * @returns {boolean} true if the command is valid
//  */
// export function validateCommand(command: ApplicationCommandData) {
//     if (command.type === ApplicationCommandType.User) {
//         // const { name, nameLocalizations, dmPermission, defaultMemberPermissions } = command
//         // if (typeof name === 'string') {
//         //     if (typeof nameLocalizations === 'object' || typeof nameLocalizations === 'undefined') {
//         //         if (defaultMemberPermissions === null || typeof defaultMemberPermissions === 'undefined' || typeof PermissionsBitField) {
//         //     } else return false
//         // } else return false
//     } else return true
// }

// export function parseCommand(command: ApplicationCommandData) {
//     const newcommand: any = {}
//     if (!validateCommand(command)) throw new Error('Invalid command')
//     const { type } = command
//     if (type === ApplicationCommandType.User) {
//         //user
//         newcommand.type = ApplicationCommandType.User
//     } else if (type === ApplicationCommandType.Message) {
//         //message
//         newcommand.type = ApplicationCommandType.Message
//     } else if (type === ApplicationCommandType.ChatInput || type === undefined) {
//         //chat
//         newcommand.type = ApplicationCommandType.ChatInput
//     }
// }
