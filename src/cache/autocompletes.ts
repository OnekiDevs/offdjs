import { CacheHandler, InteractionHandler } from '../utils.js'
import { AutocompleteInteraction } from 'discord.js'

export default new CacheHandler<InteractionHandler<AutocompleteInteraction>>()
