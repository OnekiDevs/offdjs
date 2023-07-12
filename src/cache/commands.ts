import { CacheHandler, InteractionHandler } from '../utils.js'
import { ChatInputCommandInteraction } from 'discord.js'

export default new CacheHandler<InteractionHandler<ChatInputCommandInteraction>>()
