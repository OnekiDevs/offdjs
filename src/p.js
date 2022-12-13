import { ApplicationCommandManager } from 'discord.js'

/**
 * @type {(command: ApplicationCommandDataResolvable) => import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody}
 */
export const p = ApplicationCommandManager.transformCommand
