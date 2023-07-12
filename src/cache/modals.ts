import { CacheHandler, InteractionHandler } from '../utils.js'
import { ModalSubmitInteraction } from 'discord.js'

export default new CacheHandler<InteractionHandler<ModalSubmitInteraction>>()
