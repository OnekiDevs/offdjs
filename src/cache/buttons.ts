import { CacheHandler, InteractionHandler } from '../utils.js'
import { ButtonInteraction } from 'discord.js'

export default new CacheHandler<InteractionHandler<ButtonInteraction>>()
