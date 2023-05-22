import { CacheHandler, registerCache } from '../utils.js'
import type { InteractionHandler } from '../types.js'
import { ModalSubmitInteraction } from 'discord.js'
import { join } from 'node:path'

export default await registerCache(
    join(process.cwd(), 'modals'),
    new CacheHandler<InteractionHandler<ModalSubmitInteraction>>(),
)
