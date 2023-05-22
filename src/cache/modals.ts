import { CacheHandler, registerCache } from '../utils.js'
import { ModalSubmitInteraction } from 'discord.js'
import { InteractionHandler } from '../types.js'
import { join } from 'node:path'

export default await registerCache(
    join(process.cwd(), 'modals'),
    new CacheHandler<InteractionHandler<ModalSubmitInteraction>>(),
)
