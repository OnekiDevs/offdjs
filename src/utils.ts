import {
    Message,
    BaseInteraction,
    RESTPostAPIApplicationCommandsJSONBody,
    ApplicationCommandDataResolvable,
    ApplicationCommand
} from 'discord.js'
import { p } from './p.js'
import client from './index.js'

/**
 * It takes an interaction and returns a function that takes a phrase and returns a translation
 * @param {Interaction} interaction - Interaction - The interaction object that contains the locale and client.
 * @returns {(phrase: string, params?: object): string }
 */
export function Translator(interaction: BaseInteraction | Message<true>): (phrase: string, params?: object) => string {
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

/**
 * It takes a object and returns another object formatted for the discord api
 * @param {ApplicationCommandData} command - The object to parse
 * @returns {RESTPostAPIApplicationCommandsJSONBody} - The command in the correct format to send to the API
 * @example parseCommand({
 *     name: 'say',
 *     options: [{
 *         name: 'text',
 *         description: 'text to say',
 *         required: true
 *     }]
 * })
 * // {
 * //     type: 1,
 * //     name: 'say',
 * //     description: '...',
 * //     options: [{
 * //         name: 'text',
 * //         description: 'text to say',
 * //         required: true,
 * //         type: 3
 * //    }]
 * // }
 */
export function parseAPICommand(
    command: ApplicationCommandDataResolvable | ApplicationCommand
): RESTPostAPIApplicationCommandsJSONBody {
    if (!(command as { name: string }).name) throw new Error('Command must have a name')
    if (!(command as { description: string }).description) (command as { description: string }).description = '...'
    return p(command as ApplicationCommandDataResolvable)
}
