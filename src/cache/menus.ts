import { CacheHandler, InteractionHandler } from '../utils.js'
import { AnySelectMenuInteraction } from 'discord.js'

export default new CacheHandler<InteractionHandler<AnySelectMenuInteraction>>()
